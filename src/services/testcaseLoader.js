const prisma = require('../prisma');

class TestcaseLoader {
  /**
   * Loads public and hidden test cases for a problem from the DB.
   * @param {number} problemId
   * @returns {Promise<Array>} List of testcase records
   */
  async load(problemId) {
    const testCases = await prisma.testCase.findMany({
      where: { problemId },
      orderBy: { id: 'asc' }
    });

    if (!testCases || testCases.length === 0) {
      throw new Error(`This problem (ID: ${problemId}) does not have any test cases configured.`);
    }

    return testCases.map(tc => ({
      id: tc.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput || tc.output || '', // Handle output key variations
      isHidden: tc.isHidden || false
    }));
  }
}

module.exports = new TestcaseLoader();
