class PistonRunner {
  /**
   * Executes source code by mimicking Piston REST requests.
   */
  async execute(artifact, language, input, options = {}) {
    return {
      stdout: 'Mock Piston stdout\n',
      stderr: '',
      exitInfo: { code: 0, signal: null },
      metrics: {
        executionTimeMs: 120,
        wallClockMs: 150,
        memoryKb: 10240,
        outputSize: 20
      },
      limitError: null
    };
  }
}

module.exports = new PistonRunner();
