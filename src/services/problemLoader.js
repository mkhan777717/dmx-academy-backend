const prisma = require('../prisma');

class ProblemLoader {
  /**
   * Loads problem metadata and normalizes parameter/limit specs from the DB.
   * @param {number} problemId
   * @returns {Promise<Object>} Normalized problemMeta
   */
  async loadProblem(problemId) {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId }
    });

    if (!problem) {
      throw new Error(`Problem not found for ID: ${problemId}`);
    }

    // Parse parameters list
    let parameters = [];
    if (problem.parameters) {
      parameters = typeof problem.parameters === 'string'
        ? JSON.parse(problem.parameters)
        : problem.parameters;
    }

    // Determine limits
    const timeLimitMs = problem.timeLimit ? parseInt(problem.timeLimit, 10) : 3000;
    const memoryLimitKb = problem.memoryLimit ? parseInt(problem.memoryLimit, 10) * 1024 : 256 * 1024; // Convert MB to KB

    // Resolve judge strategy ID: exact, float, token, tree, graph, special, interactive.
    // Default to exact.
    let strategyId = 'exact';
    if (problem.judgeStrategy) {
      strategyId = problem.judgeStrategy.toLowerCase();
    } else {
      // Infers strategy from return type where possible
      const retType = (problem.returnType || '').toUpperCase();
      if (retType === 'TREENODE') {
        strategyId = 'tree';
      } else if (retType === 'LISTNODE') {
        // ListNode defaults to exact matching on stringified lists
        strategyId = 'exact';
      } else if (retType === 'GRAPHNODE') {
        strategyId = 'graph';
      }
    }

    return {
      id: problem.id,
      title: problem.title,
      slug: problem.slug,
      category: problem.category || 'FUNCTIONAL',
      parameters,
      returnType: problem.returnType || 'INT',
      functionName: problem.functionName || 'solve',
      limits: {
        timeout: timeLimitMs,
        memoryLimitKb
      },
      judgeStrategy: strategyId,
      metadata: {
        epsilon: problem.epsilon || 1e-6,
        customValidator: problem.customValidator || null
      }
    };
  }
}

module.exports = new ProblemLoader();
