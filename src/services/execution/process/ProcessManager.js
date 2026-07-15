const { spawn, execSync } = require('child_process');

class ProcessManager {
  /**
   * Spawns a new subprocess.
   * @param {string} command
   * @param {Array} args
   * @param {Object} options
   * @returns {ChildProcess}
   */
  spawnProcess(command, args = [], options = {}) {
    // Spawn detached on non-Windows platforms to support process group cleanup
    const isWin = process.platform === 'win32';
    const spawnOpts = {
      detached: !isWin,
      ...options
    };
    return spawn(command, args, spawnOpts);
  }

  /**
   * Safe execution wrapper returning exit code and outputs.
   */
  wait(child, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      let timer;
      let finished = false;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
      };

      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          if (finished) return;
          finished = true;
          cleanup();
          this.terminateProcessTree(child.pid);
          reject(new Error('TIMEOUT'));
        }, timeoutMs);
      }

      child.on('close', (code, signal) => {
        if (finished) return;
        finished = true;
        cleanup();
        resolve({ code, signal });
      });

      child.on('error', (err) => {
        if (finished) return;
        finished = true;
        cleanup();
        reject(err);
      });
    });
  }

  /**
   * Forcefully terminates a child process and its children.
   * @param {number} pid - Process ID
   */
  terminateProcessTree(pid) {
    if (!pid) return;

    try {
      if (process.platform === 'win32') {
        // Windows: /F kills force, /T kills tree
        execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
      } else {
        // Unix: kill process group (negative PID kills PGID)
        try {
          process.kill(-pid, 'SIGKILL');
        } catch (e) {
          // Fallback to killing direct pid if PGID fails
          process.kill(pid, 'SIGKILL');
        }
      }
    } catch (err) {
      // Ignore if process already exited
    }
  }
}

module.exports = new ProcessManager();
