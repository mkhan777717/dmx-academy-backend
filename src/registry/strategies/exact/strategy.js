class ExactStrategy {
  getName() {
    return 'exact';
  }

  supports(problemMetadata) {
    // Supports all functional and design categories
    return true;
  }

  validateConfiguration() {
    // No extra parameters required for exact comparison
    return true;
  }

  judge(expectedOutput, actualOutput, metadata) {
    const expected = (expectedOutput || '').trim();
    const actual = (actualOutput || '').trim();
    return expected === actual;
  }
}

module.exports = ExactStrategy;
