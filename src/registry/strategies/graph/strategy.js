const GraphNode = require('../../../runtime/graph/v1/javascript/graph');

class GraphStrategy {
  getName() {
    return 'graph';
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

    // Fast path: string match
    if (expected === actual) return true;

    try {
      const g1 = GraphNode.deserialize(expected);
      const g2 = GraphNode.deserialize(actual);
      return this.isSameGraph(g1, g2);
    } catch (e) {
      return false;
    }
  }

  isSameGraph(g1, g2) {
    if (!g1 && !g2) return true;
    if (!g1 || !g2) return false;

    // Direct comparison using the deterministic canonical serialization format
    const s1 = GraphNode.serialize(g1);
    const s2 = GraphNode.serialize(g2);
    return s1 === s2;
  }
}

module.exports = GraphStrategy;
