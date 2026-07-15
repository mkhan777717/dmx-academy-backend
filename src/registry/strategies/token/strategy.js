class TokenStrategy {
  getName() {
    return 'token';
  }

  supports(problemMetadata) {
    return true;
  }

  validateConfiguration() {
    return true;
  }

  judge(expectedOutput, actualOutput, metadata) {
    const expectedTokens = (expectedOutput || '').trim().split(/\s+/).filter(Boolean);
    const actualTokens = (actualOutput || '').trim().split(/\s+/).filter(Boolean);

    if (expectedTokens.length !== actualTokens.length) {
      return false;
    }

    for (let i = 0; i < expectedTokens.length; i++) {
      if (expectedTokens[i] !== actualTokens[i]) {
        return false;
      }
    }
    return true;
  }
}

module.exports = TokenStrategy;
