const ExecutionBackend = require('../ExecutionBackend');
const PistonCompiler = require('./PistonCompiler');
const PistonRunner = require('./PistonRunner');

class PistonBackend extends ExecutionBackend {
  getCapabilities() {
    return {
      supportsCompilation: false,
      supportsInteractive: false,
      supportsSql: false,
      supportsStreaming: false,
      supportsNetwork: true,
      supportsCustomJudge: false
    };
  }

  async compile(sourceCode, language, options = {}) {
    return PistonCompiler.compile(sourceCode, language, options);
  }

  async execute(artifact, language, input, options = {}) {
    return PistonRunner.execute(artifact, language, input, options);
  }

  async cleanup(artifact) {
    // Piston execution is stateless, no cleanup required
  }

  async health() {
    return true;
  }
}

module.exports = PistonBackend;
