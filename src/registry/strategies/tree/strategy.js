const TreeNode = require('../../../runtime/tree/v1/javascript/tree');

class TreeStrategy {
  getName() {
    return 'tree';
  }

  supports(problemMetadata) {
    return true;
  }

  validateConfiguration() {
    return true;
  }

  judge(expectedOutput, actualOutput, metadata) {
    const expected = (expectedOutput || '').trim();
    const actual = (actualOutput || '').trim();

    // Fast path: String match
    if (expected === actual) return true;

    try {
      const expectedTree = TreeNode.deserialize(expected);
      const actualTree = TreeNode.deserialize(actual);
      return this.isSameTree(expectedTree, actualTree);
    } catch (error) {
      // Fallback to strict match if serialization is invalid
      return false;
    }
  }

  isSameTree(p, q) {
    if (!p && !q) return true;
    if (!p || !q) return false;
    return p.val === q.val && 
           this.isSameTree(p.left, q.left) && 
           this.isSameTree(p.right, q.right);
  }
}

module.exports = TreeStrategy;
