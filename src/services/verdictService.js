class VerdictService {
  /**
   * Translates testcase execution and compilation outcomes to a single final verdict string.
   * @param {Array} testcaseResults - List of testcase run results
   * @param {boolean} compilationSuccess - Whether compile step succeeded
   * @returns {string} Final verdict status string
   */
  getFinalVerdict(testcaseResults, compilationSuccess) {
    if (!compilationSuccess) {
      return 'COMPILATION_ERROR';
    }

    if (!Array.isArray(testcaseResults) || testcaseResults.length === 0) {
      return 'INTERNAL_ERROR';
    }

    // Prioritize Limit Exceeded and Runtime Exceptions over Wrong Answers (standard OJ rules)
    for (const result of testcaseResults) {
      if (result.status && result.status !== 'SUCCESS') {
        return result.status; // Returns TLE, MLE, OLE, RUNTIME_ERROR, etc.
      }
    }

    // Check for wrong answers
    for (const result of testcaseResults) {
      if (!result.isPassed) {
        return 'WRONG_ANSWER';
      }
    }

    return 'ACCEPTED';
  }
}

module.exports = new VerdictService();
