const ProcessManager = require('../../process/ProcessManager');
const ResourceMonitor = require('../../monitors/ResourceMonitor');
const { MemoryLimitExceededError } = require('../../errors/ExecutionError');

class LocalRunner {
  /**
   * Executes artifact locally using system subprocesses.
   * @param {Object} artifact
   * @param {string} language
   * @param {string} input
   * @param {Object} options
   * @returns {Promise<Object>} Process outcomes
   */
  async execute(artifact, language, input, options = {}) {
    const timeoutMs = options.timeout || 3000;
    const memoryLimitKb = options.memoryLimitKb || 256 * 1024; // 256MB Default
    const maxOutputBytes = options.maxOutputBytes || 5 * 1024 * 1024; // 5MB Default

    let command = '';
    const args = [];

    if (artifact.type === 'binary') {
      command = artifact.location;
    } else {
      if (language === 'python') {
        command = process.platform === 'win32' ? 'python' : 'python3';
      } else if (language === 'javascript') {
        command = 'node';
      } else {
        throw new Error(`Unsupported local interpreter language: ${language}`);
      }
      args.push(artifact.location);
    }

    const child = ProcessManager.spawnProcess(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    const monitor = new ResourceMonitor(maxOutputBytes);

    const stdoutBuffer = [];
    const stderrBuffer = [];
    let limitError = null;

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();

    child.stdout.on('data', (data) => {
      stdoutBuffer.push(data);
    });
    child.stderr.on('data', (data) => {
      stderrBuffer.push(data);
    });

    monitor.start(child, (err) => {
      limitError = err;
      ProcessManager.terminateProcessTree(child.pid);
    });

    let exitInfo = {};
    try {
      exitInfo = await ProcessManager.wait(child, timeoutMs);
    } catch (e) {
      if (e.message === 'TIMEOUT') {
        exitInfo = { code: null, signal: 'SIGKILL' };
      } else {
        throw e;
      }
    } finally {
      monitor.stop();
    }

    const stdout = Buffer.concat(stdoutBuffer).toString('utf8');
    const stderr = Buffer.concat(stderrBuffer).toString('utf8');
    const metrics = monitor.getMetrics();

    // Check if memory limit is breached
    if (metrics.memoryKb > memoryLimitKb && !limitError) {
      limitError = new MemoryLimitExceededError(
        `Memory limit exceeded: used ${metrics.memoryKb} KB, limit ${memoryLimitKb} KB`
      );
    }

    return {
      stdout,
      stderr,
      exitInfo,
      metrics,
      limitError
    };
  }
}

module.exports = new LocalRunner();
