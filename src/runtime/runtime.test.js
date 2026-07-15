const assert = require('assert');
const TreeNode = require('./tree/v1/javascript/tree');
const ListNode = require('./list/v1/javascript/list');
const GraphNode = require('./graph/v1/javascript/graph');
const typeRegistry = require('../services/typeRegistry');

function runTests() {
  try {
    console.log('====================================================');
    console.log('  RUNNING STRUCTURAL RUNTIME LIBRARIES UNIT TESTS  ');
    console.log('====================================================');

    // 1. Test ListNode deserialization and serialization
    console.log('Testing ListNode Runtime (JavaScript)...');
    const listStr = '[1,2,3,4]';
    const listHead = ListNode.deserialize(listStr);
    assert.strictEqual(listHead.val, 1);
    assert.strictEqual(listHead.next.val, 2);
    assert.strictEqual(listHead.next.next.val, 3);
    assert.strictEqual(listHead.next.next.next.val, 4);
    assert.strictEqual(listHead.next.next.next.next, null);

    const serializedList = ListNode.serialize(listHead);
    assert.strictEqual(serializedList, listStr);
    assert.strictEqual(ListNode.deserialize('[]'), null);
    console.log('   ListNode: Passed ✅');

    // 2. Test TreeNode deserialization and serialization
    console.log('Testing TreeNode Runtime (JavaScript)...');
    const treeStr = '[1,2,3,null,4]';
    const treeRoot = TreeNode.deserialize(treeStr);
    assert.strictEqual(treeRoot.val, 1);
    assert.strictEqual(treeRoot.left.val, 2);
    assert.strictEqual(treeRoot.right.val, 3);
    assert.strictEqual(treeRoot.left.left, null);
    assert.strictEqual(treeRoot.left.right.val, 4);

    const serializedTree = TreeNode.serialize(treeRoot);
    assert.strictEqual(serializedTree, treeStr);
    assert.strictEqual(TreeNode.deserialize('[]'), null);
    console.log('   TreeNode: Passed ✅');

    // 3. Test Graph Node deserialization and serialization
    console.log('Testing GraphNode Runtime (JavaScript)...');
    const graphStr = '[[2,4],[1,3],[2,4],[1,3]]';
    const graphRoot = GraphNode.deserialize(graphStr);
    assert.strictEqual(graphRoot.val, 1);
    assert.strictEqual(graphRoot.neighbors.length, 2);
    assert.strictEqual(graphRoot.neighbors[0].val, 2);
    assert.strictEqual(graphRoot.neighbors[1].val, 4);
    
    // Assert cyclic connection: Node 2 neighbor 1 is Node 1
    assert.strictEqual(graphRoot.neighbors[0].neighbors[0].val, 1);
    assert.strictEqual(graphRoot.neighbors[0].neighbors[0], graphRoot);

    const serializedGraph = GraphNode.serialize(graphRoot);
    assert.strictEqual(serializedGraph, graphStr);
    console.log('   GraphNode: Passed ✅');

    // 4. Test Integration with Module 1 (TypeRegistry)
    console.log('Testing Type Registry dynamic integration...');
    typeRegistry.refresh(); // Refresh registry cache to load new definitions
    assert.strictEqual(typeRegistry.hasType('TreeNode'), true);
    assert.strictEqual(typeRegistry.hasType('ListNode'), true);
    assert.strictEqual(typeRegistry.hasType('GraphNode'), true);

    const treeType = typeRegistry.getType('TreeNode', 'javascript');
    assert.strictEqual(treeType.typeName, 'TreeNode');
    assert.strictEqual(treeType.library, 'tree/v1/javascript/tree.js');
    assert.strictEqual(treeType.deserialize, 'TreeNode.deserialize({varName})');

    const listTypeCpp = typeRegistry.getType('ListNode', 'cpp');
    assert.strictEqual(listTypeCpp.typeName, 'ListNode*');
    assert.strictEqual(listTypeCpp.library, 'list/v1/cpp/list.hpp');
    assert.strictEqual(listTypeCpp.cleanup, 'freeList({varName})');

    console.log('   TypeRegistry Integration: Passed ✅');

    console.log('✅ All structural runtime libraries tests passed successfully!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ Structural runtime libraries tests failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
