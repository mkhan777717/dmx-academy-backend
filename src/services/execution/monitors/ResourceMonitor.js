const CpuMonitor = require('./CpuMonitor');
const MemoryMonitor = require('./MemoryMonitor');
const OutputMonitor = require('./OutputMonitor');

class ResourceMonitor {
  constructor(maxOutputBytes = 10 * 1024 * 1024) {
    this.cpu = new CpuMonitor();
    this.memory = new MemoryMonitor();
    this.output = new OutputMonitor(maxOutputBytes);
    this.child = null;
  }

  /**
   * Starts tracking child process system utilization.
   * @param {ChildProcess} child
   * @param {Function} onLimitExceeded - Triggered if output bounds are crossed
   */
  start(child, onLimitExceeded) {
    this.child = child;
    this.cpu.start();
    this.memory.start(child.pid);
    this.output.monitor(child, onLimitExceeded);
  }

  stop() {
    this.cpu.stop();
    this.memory.stop();
  }

  /**
   * Compiles collected resource usage metrics.
   * @returns {Object} System resource consumption stats
   */
  getMetrics() {
    return {
      executionTimeMs: this.cpu.getCpuTimeMs(),
      wallClockMs: this.cpu.getWallClockMs(),
      memoryKb: this.memory.getPeakMemoryKb(),
      outputSize: this.output.getOutputSize()
    };
  }
}

module.exports = ResourceMonitor;
