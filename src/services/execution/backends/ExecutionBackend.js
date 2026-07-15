class ExecutionBackend {
  /**
   * Returns capabilities configured for this runtime backend.
   * @returns {Object} Capabilities dictionary
   */
  getCapabilities() {
    return {
      supportsCompilation: false,
      supportsInteractive: false,
      supportsSql: false,
      supportsStreaming: false,
      supportsNetwork: false,
      supportsCustomJudge: false
    };
  }

  /**
   * Compile source code into executable binary or script artifact.
   * @param {string} sourceCode
   * @param {string} language
   * @param {Object} options
   * @returns {Promise<Object>} CompilationResult
   */
  async compile(sourceCode, language, options = {}) {
    throw new Error('compile() not implemented by backend.');
  }

  /**
   * Execute compiled artifact or script against standard input.
   * @param {Object} artifact - CompilationArtifact
   * @param {string} language
   * @param {string} input
   * @param {Object} options
   * @returns {Promise<Object>} ExecutionResult
   */
  async execute(artifact, language, input, options = {}) {
    throw new Error('execute() not implemented by backend.');
  }

  /**
   * Cleans workspace resources and binaries after completion.
   * @param {Object} artifact
   * @returns {Promise<void>}
   */
  async cleanup(artifact) {
    throw new Error('cleanup() not implemented by backend.');
  }

  /**
   * System health check.
   * @returns {Promise<boolean>}
   */
  async health() {
    return true;
  }
}

module.exports = ExecutionBackend;
