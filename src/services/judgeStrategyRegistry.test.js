const assert = require('assert');
const fs = require('fs');
const path = require('path');
const registry = require('./judgeStrategyRegistry');

function runTests() {
  try {
    console.log('====================================================');
    console.log('  RUNNING JUDGE STRATEGY REGISTRY UNIT TESTS        ');
    console.log('====================================================');

    // 1. Verify registry loading and cache APIs
    assert.strictEqual(registry.hasStrategy('exact'), true);
    assert.strictEqual(registry.hasStrategy('token'), true);
    assert.strictEqual(registry.hasStrategy('float'), true);
    assert.strictEqual(registry.hasStrategy('tree'), true);
    assert.strictEqual(registry.hasStrategy('graph'), true);
    assert.strictEqual(registry.hasStrategy('special'), true);
    assert.strictEqual(registry.hasStrategy('interactive'), true);
    assert.strictEqual(registry.hasStrategy('unknown_strategy'), false);

    const all = registry.getAllStrategies();
    assert.ok(all.some(m => m.id === 'exact'));
    assert.ok(all.some(m => m.id === 'float'));

    const list = registry.getSupportedStrategies();
    assert.ok(list.includes('exact'));
    assert.ok(list.includes('interactive'));

    // 2. Assert Unknown Strategy descriptive error
    assert.throws(() => {
      registry.getStrategy('tree_v2');
    }, /Unknown judge strategy "tree_v2". Available: \[.*exact.*\]/, 'Should throw descriptive error on missing strategy');

    // 3. Test exact comparison strategy logic
    console.log('Testing Exact Judge Strategy...');
    const exact = registry.getStrategy('exact');
    assert.strictEqual(exact.judge('hello', 'hello'), true);
    assert.strictEqual(exact.judge('hello', ' hello '), true, 'Exact judge should strip outer padding');
    assert.strictEqual(exact.judge('hello', 'world'), false);
    assert.strictEqual(exact.judge('123', '123'), true);
    console.log('   Exact: Passed ✅');

    // 4. Test token comparison strategy logic
    console.log('Testing Token Judge Strategy...');
    const token = registry.getStrategy('token');
    assert.strictEqual(token.judge('1 \n 2 \n 3', '1 2 3'), true);
    assert.strictEqual(token.judge('a  b\tc', 'a b c'), true, 'Token judge ignores spaces and tabs');
    assert.strictEqual(token.judge('a b', 'a b d'), false);
    console.log('   Token: Passed ✅');

    // 5. Test float comparison strategy logic
    console.log('Testing Float Judge Strategy...');
    const float = registry.getStrategy('float');
    assert.strictEqual(float.judge('3.14159', '3.14159', { epsilon: 1e-5 }), true);
    assert.strictEqual(float.judge('3.14159', '3.14158', { epsilon: 1e-4 }), true, 'Within tolerance');
    assert.strictEqual(float.judge('3.14159', '3.14158', { epsilon: 1e-6 }), false, 'Outside tolerance');
    // Multiple float tokens
    assert.strictEqual(float.judge('1.0 2.0', '1.000001 2.000001', { epsilon: 1e-5 }), true);
    assert.strictEqual(float.judge('1.0 2.0', '1.01 2.0', { epsilon: 1e-5 }), false);
    console.log('   Float: Passed ✅');

    // 6. Test tree comparison strategy logic (Structural Equivalence)
    console.log('Testing Tree Judge Strategy...');
    const tree = registry.getStrategy('tree');
    assert.strictEqual(tree.judge('[1,2,3,null,4]', '[1,2,3,null,4]'), true);
    assert.strictEqual(tree.judge('[1,2,3,null,4]', ' [1, 2, 3, null, 4] '), true, 'Ignore padding spacing');
    // Different shape
    assert.strictEqual(tree.judge('[1,2,3,null,4]', '[1,2,3,4]'), false);
    // Structural equivalence with trailing null leaf nodes in different outputs
    assert.strictEqual(tree.judge('[1,2,3]', '[1,2,3,null,null]'), true, 'Should resolve structural parity regardless of trailing nulls');
    console.log('   Tree: Passed ✅');

    // 7. Test graph comparison strategy logic
    console.log('Testing Graph Judge Strategy...');
    const graph = registry.getStrategy('graph');
    const graph1 = '[[2,4],[1,3],[2,4],[1,3]]';
    const graph2 = '[[2,4],[1,3],[2,4],[1,3]]';
    const graphDiff = '[[2],[1,3],[2,4],[1,3]]';
    assert.strictEqual(graph.judge(graph1, graph2), true);
    assert.strictEqual(graph.judge(graph1, graphDiff), false);
    console.log('   Graph: Passed ✅');

    // 8. Test special comparison strategy logic (Custom Validation scripts)
    console.log('Testing Special Judge Strategy...');
    const special = registry.getStrategy('special');
    // Normal fallback
    assert.strictEqual(special.judge('hello', 'hello'), true);
    // Custom check: check if output is even
    const metadata = {
      input: '10',
      customValidator: 'return parseInt(actual) % 2 === 0;'
    };
    assert.strictEqual(special.judge('2', '4', metadata), true);
    assert.strictEqual(special.judge('2', '5', metadata), false);
    console.log('   Special: Passed ✅');

    // 9. Test interactive comparison strategy placeholder
    console.log('Testing Interactive Strategy (Placeholder)...');
    const interactive = registry.getStrategy('interactive');
    assert.strictEqual(interactive.judge('', ''), true);
    console.log('   Interactive: Passed ✅');

    // 10. Cache and Reload tests
    console.log('Testing Registry Cache and Reloads...');
    registry.reload();
    assert.strictEqual(registry.hasStrategy('exact'), true);
    console.log('   Cache Reload: Passed ✅');

    console.log('✅ All judge strategy registry tests passed successfully!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ Judge strategy registry tests failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
