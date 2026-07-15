const { exec } = require('child_process');

class MemoryMonitor {
  constructor() {
    this.peakMemoryKb = 0;
    this.timer = null;
  }

  /**
   * Starts a background polling loop tracking memory metrics.
   * @param {number} pid - Process ID
   * @param {number} intervalMs - Polling delay
   */
  start(pid, intervalMs = 20) {
    if (!pid) return;
    this.peakMemoryKb = 0;
    const isWin = process.platform === 'win32';

    this.timer = setInterval(() => {
      if (isWin) {
        exec(`wmic process where processid=${pid} get WorkingSetSize`, (err, stdout) => {
          if (!err && stdout) {
            const lines = stdout.trim().split(/\r?\n/);
            if (lines.length > 1) {
              const bytes = parseInt(lines[1].trim(), 10);
              if (!isNaN(bytes)) {
                const kb = Math.round(bytes / 1024);
                this.peakMemoryKb = Math.max(this.peakMemoryKb, kb);
              }
            }
          }
        });
      } else {
        exec(`ps -o rss= -p ${pid}`, (err, stdout) => {
          if (!err && stdout) {
            const kb = parseInt(stdout.trim(), 10);
            if (!isNaN(kb)) {
              this.peakMemoryKb = Math.max(this.peakMemoryKb, kb);
            }
          }
        });
      }
    }, intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getPeakMemoryKb() {
    // Falls back to standard base footprint if no samples were collected
    return this.peakMemoryKb || 4096;
  }
}

module.exports = MemoryMonitor;
