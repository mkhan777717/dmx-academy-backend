const ExecutionBackend = require('../ExecutionBackend');
const DockerCompiler = require('./DockerCompiler');
const DockerRunner = require('./DockerRunner');
const LocalBackend = require('../local/LocalBackend');

class DockerBackend extends ExecutionBackend {
  constructor() {
    super();
    this.localDelegate = new LocalBackend();
  }

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
    return DockerCompiler.compile(sourceCode, language, options);
  }

  async execute(artifact, language, input, options = {}) {
    return DockerRunner.execute(artifact, language, input, options);
  }

  async cleanup(artifact) {
    return this.localDelegate.cleanup(artifact);
  }

  async health() {
    return true;
  }
}

module.exports = DockerBackend;
