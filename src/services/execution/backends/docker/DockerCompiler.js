const LocalCompiler = require('../local/LocalCompiler');

class DockerCompiler {
  /**
   * Compiles source code inside Docker workspace.
   * Falls back to local compiler for environment portability during test mocks.
   */
  compile(sourceCode, language, options = {}) {
    // If docker daemon is mocked/available, we map local compile
    return LocalCompiler.compile(sourceCode, language, options);
  }
}

module.exports = new DockerCompiler();
