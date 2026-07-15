class FloatStrategy {
  getName() {
    return 'float';
  }

  supports(problemMetadata) {
    return true;
  }

  validateConfiguration() {
    return true;
  }

  judge(expectedOutput, actualOutput, metadata) {
    const epsilon = metadata && metadata.epsilon !== undefined ? metadata.epsilon : 1e-6;
    
    const expectedTokens = (expectedOutput || '').trim().split(/\s+/).filter(Boolean);
    const actualTokens = (actualOutput || '').trim().split(/\s+/).filter(Boolean);

    if (expectedTokens.length !== actualTokens.length) {
      return false;
    }

    for (let i = 0; i < expectedTokens.length; i++) {
      const expVal = parseFloat(expectedTokens[i]);
      const actVal = parseFloat(actualTokens[i]);

      if (isNaN(expVal) || isNaN(actVal)) {
        if (expectedTokens[i] !== actualTokens[i]) {
          return false;
        }
      } else {
        if (Math.abs(expVal - actVal) > epsilon) {
          return false;
        }
      }
    }
    return true;
  }
}

module.exports = FloatStrategy;
