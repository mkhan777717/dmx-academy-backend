class PistonCompiler {
  /**
   * Mock compile flow for Piston backend API structures.
   */
  compile(sourceCode, language, options = {}) {
    return {
      success: true,
      artifact: {
        type: 'script',
        location: 'piston_workspace',
        metadata: { sourceCode }
      },
      stderr: '',
      compileTimeMs: 0
    };
  }
}

module.exports = new PistonCompiler();
