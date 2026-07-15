class CpuMonitor {
  constructor() {
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.startTime = process.hrtime();
  }

  stop() {
    this.endTime = process.hrtime(this.startTime);
  }

  getWallClockMs() {
    if (!this.endTime) return 0;
    return Math.round((this.endTime[0] * 1000) + (this.endTime[1] / 1000000));
  }

  getCpuTimeMs() {
    // Falls back to Wall Clock for base local adaptation
    return this.getWallClockMs();
  }
}

module.exports = CpuMonitor;
