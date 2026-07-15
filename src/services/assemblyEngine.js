const path = require('path');
const languageRegistry = require('./languageRegistry');
const driverRegistry = require('./driverRegistry');
const dependencyResolver = require('./dependencyResolver');
const runtimeResolver = require('./runtimeResolver');
const templateRenderer = require('./templateRenderer');
const wrapperValidator = require('./wrapperValidator');

class AssemblyEngine {
  /**
   * Orchestrates the loading, resolving, rendering, and validation of solution code.
   * @param {string} language - Target language e.g. "cpp", "python", "javascript"
   * @param {string} userCode - Raw user code snippet
   * @param {Object} problemMeta - Problem spec mapping { category, parameters, returnType, functionName }
   * @returns {string} Assembled source code ready for sandbox compile/run
   */
  assembleCode(language, userCode, problemMeta) {
    if (!language || !userCode || !problemMeta) {
      throw new Error('Language, userCode, and problemMeta are required to assemble code.');
    }

    const lang = language.toLowerCase();
    const category = (problemMeta.category || 'FUNCTIONAL').toUpperCase();

    // 1. Resolve Language details
    if (!languageRegistry.hasLanguage(lang)) {
      throw new Error(`Unsupported language requested for assembly: ${language}`);
    }

    // 2. Resolve Driver Template
    if (!driverRegistry.hasDriver(category, lang)) {
      throw new Error(`Driver template for category '${category}' and language '${language}' is not registered.`);
    }
    const driverTemplate = driverRegistry.getDriver(category, lang);

    // 3. Resolve Parameter & Type dependencies
    const { runtimes, typeDefinitions } = dependencyResolver.resolveDependencies(
      problemMeta.parameters,
      problemMeta.returnType,
      lang
    );

    // 4. Resolve and combine Runtime Structural Libraries
    const runtimeCodes = [];
    const processedRuntimes = new Set();
    
    for (const runtime of runtimes) {
      const runtimeKey = `${runtime.structure}:${runtime.version}`;
      if (!processedRuntimes.has(runtimeKey)) {
        processedRuntimes.add(runtimeKey);
        const resolved = runtimeResolver.resolveRuntime(runtime.structure, runtime.version, lang);
        runtimeCodes.push(resolved.content);
      }
    }

    // 5. Build dynamic code parts (Execution and Printing block)
    const functionName = problemMeta.functionName || 'solve';
    const executionParts = [];
    const printParts = [];
    const cleanupParts = [];
    const paramNames = [];

    // Parameter declarations and reading logic
    problemMeta.parameters.forEach((param, idx) => {
      const typeDef = typeDefinitions.get(param.name);
      paramNames.push(param.name);

      if (lang === 'cpp') {
        const inputVar = `line${idx}`;
        executionParts.push(
          `string ${inputVar};\n    ` +
          `if (getline(cin, ${inputVar})) {\n        ` +
          `// Remove trailing CR if present on Windows host\n        ` +
          `if (!${inputVar}.empty() && ${inputVar}.back() == '\\r') ${inputVar}.pop_back();\n    }\n    ` +
          `${typeDef.typeName} ${param.name} = ${typeDef.deserialize.replace(/{varName}/g, inputVar)};`
        );
      } else if (lang === 'python') {
        executionParts.push(
          `if len(lines) > ${idx}:\n        ` +
          `${param.name} = ${typeDef.deserialize.replace(/{varName}/g, `lines[${idx}].strip()`)}`
        );
      } else if (lang === 'javascript') {
        executionParts.push(
          `if (lines.length > ${idx}) {\n        ` +
          `const ${param.name} = ${typeDef.deserialize.replace(/{varName}/g, `lines[${idx}].trim()`)};\n    }`
        );
      }

      // Memory cleanup declarations (relevant for C++ pointers)
      if (typeDef.cleanup) {
        cleanupParts.push(typeDef.cleanup.replace(/{varName}/g, param.name) + ";");
      }
    });

    const returnTypeDef = typeDefinitions.get('__return__');

    // Execution call
    if (lang === 'cpp') {
      executionParts.push('Solution solver;');
      const returnTypeName = returnTypeDef ? returnTypeDef.typeName : 'void';
      if (returnTypeName !== 'void') {
        executionParts.push(`${returnTypeName} result = solver.${functionName}(${paramNames.join(', ')});`);
      } else {
        executionParts.push(`solver.${functionName}(${paramNames.join(', ')});`);
      }
    } else if (lang === 'python') {
      if (returnTypeDef) {
        executionParts.push(`result = solver.${functionName}(${paramNames.join(', ')})`);
      } else {
        executionParts.push(`solver.${functionName}(${paramNames.join(', ')})`);
      }
    } else if (lang === 'javascript') {
      if (returnTypeDef) {
        executionParts.push(`const result = ${functionName}(${paramNames.join(', ')});`);
      } else {
        executionParts.push(`${functionName}(${paramNames.join(', ')});`);
      }
    }

    // Print block and result serializations
    if (returnTypeDef) {
      const serializeExpr = returnTypeDef.serialize.replace(/{varName}/g, 'result');
      if (lang === 'cpp') {
        printParts.push(`cout << ${serializeExpr} << endl;`);
      } else if (lang === 'python') {
        printParts.push(`print(${serializeExpr})`);
      } else if (lang === 'javascript') {
        printParts.push(`console.log(${serializeExpr});`);
      }

      if (returnTypeDef.cleanup) {
        cleanupParts.push(returnTypeDef.cleanup.replace(/{varName}/g, 'result') + ";");
      }
    }

    // Assemble language specific main() body
    let mainBody = '';
    if (lang === 'cpp') {
      mainBody = `int main() {\n    ` +
        `${executionParts.join('\n    ')}\n    ` +
        `${printParts.join('\n    ')}\n    ` +
        `${cleanupParts.join('\n    ')}\n    ` +
        `return 0;\n}`;
    } else if (lang === 'python') {
      mainBody = `def main():\n    ` +
        `import sys\n    ` +
        `raw_input = sys.stdin.read().strip()\n    ` +
        `if not raw_input:\n        ` +
        `return\n    ` +
        `lines = raw_input.splitlines()\n    ` +
        `try:\n        ` +
        `  ${executionParts.join('\n        ')}\n        ` +
        `  ${printParts.join('\n        ')}\n    ` +
        `except Exception as e:\n        ` +
        `  sys.stderr.write(str(e))\n        ` +
        `  sys.exit(1)\n\n` +
        `if __name__ == '__main__':\n    ` +
        `main()`;
    } else if (lang === 'javascript') {
      mainBody = `function main() {\n    ` +
        `const fs = require('fs');\n    ` +
        `const rawInput = fs.readFileSync(0, 'utf-8').trim();\n    ` +
        `if (!rawInput) return;\n    ` +
        `const lines = rawInput.split(/\\r?\\n/);\n    ` +
        `try {\n        ` +
        `  ${executionParts.join('\n        ')}\n        ` +
        `  ${printParts.join('\n        ')}\n    ` +
        `} catch (e) {\n        ` +
        `  console.error(e);\n        ` +
        `  process.exit(1);\n    ` +
        `}\n}\n` +
        `main();`;
    }

    // Standard imports mapping
    let importsBlock = '';
    if (lang === 'python') {
      importsBlock = 'import sys\nimport json';
    } else if (lang === 'javascript') {
      importsBlock = "const fs = require('fs');";
    }

    // 6. Template replacements Map
    const replacements = {
      '{{IMPORTS}}': importsBlock,
      '{{RUNTIME}}': runtimeCodes.join('\n\n'),
      '{{HELPERS}}': '', // Standard C++ helpers are pre-baked in runtime libraries (list.hpp etc)
      '{{USER_CODE}}': userCode,
      '{{MAIN}}': mainBody
    };

    // Render templates
    const assembledSource = templateRenderer.render(driverTemplate, replacements);

    // 7. Validate generated source code health
    wrapperValidator.validate(assembledSource);

    return assembledSource;
  }
}

module.exports = new AssemblyEngine();
