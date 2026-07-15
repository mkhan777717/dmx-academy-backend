const fs = require('fs');
const ExecutionBackend = require('../ExecutionBackend');
const LocalCompiler = require('./LocalCompiler');
const LocalRunner = require('./LocalRunner');

class LocalBackend extends ExecutionBackend {
  getCapabilities() {
    return {
      supportsCompilation: true,
      supportsInteractive: false,
      supportsSql: false,
      supportsStreaming: false,
      supportsNetwork: false,
      supportsCustomJudge: true
    };
  }

  async compile(sourceCode, language, options = {}) {
    return LocalCompiler.compile(sourceCode, language, options);
  }

  async execute(artifact, language, input, options = {}) {
    return LocalRunner.execute(artifact, language, input, options);
  }

  async cleanup(artifact) {
    if (!artifact) return;

    // Clean compile binary
    if (artifact.location && fs.existsSync(artifact.location)) {
      try {
        fs.unlinkSync(artifact.location);
      } catch (e) {
        // Ignore files already deleted
      }
    }

    // Clean source files
    if (artifact.metadata && artifact.metadata.srcPath && fs.existsSync(artifact.metadata.srcPath)) {
      try {
        fs.unlinkSync(artifact.metadata.srcPath);
      } catch (e) {
        // Ignore files already deleted
      }
    }
  }

  async health() {
    return true;
  }
}

module.exports = LocalBackend;
