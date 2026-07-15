const { OutputLimitExceededError } = require('../errors/ExecutionError');

class OutputMonitor {
  constructor(maxSizeBytes = 10 * 1024 * 1024) { // 10MB Default
    this.maxSizeBytes = maxSizeBytes;
    this.bytesWritten = 0;
  }

  /**
   * Monitor stream outputs.
   * @param {ChildProcess} child
   * @param {Function} onLimitExceeded
   */
  monitor(child, onLimitExceeded) {
    if (!child) return;

    const checkLimit = (chunk) => {
      if (chunk) {
        this.bytesWritten += Buffer.byteLength(chunk);
        if (this.bytesWritten > this.maxSizeBytes) {
          onLimitExceeded(new OutputLimitExceededError(`Output limit exceeded: output exceeded ${this.maxSizeBytes} bytes.`));
        }
      }
    };

    if (child.stdout) {
      child.stdout.on('data', checkLimit);
    }
    if (child.stderr) {
      child.stderr.on('data', checkLimit);
    }
  }

  getOutputSize() {
    return this.bytesWritten;
  }
}

module.exports = OutputMonitor;
