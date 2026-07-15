const LocalRunner = require('../local/LocalRunner');

class DockerRunner {
  /**
   * Executes source binary or script in Docker container context.
   * Maps local executions during test mocks.
   */
  async execute(artifact, language, input, options = {}) {
    return LocalRunner.execute(artifact, language, input, options);
  }
}

module.exports = new DockerRunner();
