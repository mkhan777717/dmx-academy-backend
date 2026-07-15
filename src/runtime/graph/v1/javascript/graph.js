class Node {
  constructor(val = 0, neighbors = []) {
    this.val = val;
    this.neighbors = neighbors;
  }

  static deserialize(data) {
    if (!data) return null;
    const adj = typeof data === 'string' ? JSON.parse(data) : data;
    if (!adj || adj.length === 0) return null;

    const nodes = {};
    for (let i = 0; i < adj.length; i++) {
      nodes[i + 1] = new Node(i + 1);
    }

    for (let i = 0; i < adj.length; i++) {
      const curr = nodes[i + 1];
      const neighborsList = adj[i];
      for (const val of neighborsList) {
        curr.neighbors.push(nodes[val]);
      }
    }
    return nodes[1];
  }

  static serialize(node) {
    if (!node) return "[]";
    const adj = {};
    const visited = new Set();

    function dfs(curr) {
      if (!curr || visited.has(curr.val)) return;
      visited.add(curr.val);
      adj[curr.val] = curr.neighbors.map(n => n.val);
      for (const neighbor of curr.neighbors) {
        dfs(neighbor);
      }
    }

    dfs(node);
    const keys = Object.keys(adj).map(Number);
    if (keys.length === 0) return "[]";

    const maxVal = Math.max(...keys);
    const res = [];
    for (let i = 1; i <= maxVal; i++) {
      res.push(adj[i] || []);
    }
    return JSON.stringify(res);
  }
}

if (typeof module !== 'undefined') {
  module.exports = Node;
}
