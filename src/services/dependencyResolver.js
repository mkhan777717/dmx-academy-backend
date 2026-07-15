const typeRegistry = require('./typeRegistry');

class DependencyResolver {
  /**
   * Inspects parameters and return type to extract unique runtime library dependencies.
   * @param {Array} parameters - List of param metadata e.g. [{name: "p", type: "TreeNode"}]
   * @param {string} returnType - Return type string e.g. "BOOLEAN", "TreeNode"
   * @param {string} language - Target language ID e.g. "cpp", "python"
   * @returns {Object} { runtimes: Array<{structure, version}>, types: Map }
   */
  resolveDependencies(parameters, returnType, language) {
    if (!language) {
      throw new Error('Language ID is required to resolve dependencies.');
    }

    const uniqueLibs = new Set();
    const typeDefinitions = new Map();
    const runtimes = [];

    // 1. Resolve parameters type configs
    if (Array.isArray(parameters)) {
      for (const param of parameters) {
        const typeDef = typeRegistry.getType(param.type, language);
        typeDefinitions.set(param.name, { ...typeDef, paramName: param.name, isReturn: false });

        if (typeDef.library) {
          uniqueLibs.add(typeDef.library);
        }
      }
    }

    // 2. Resolve return type config
    if (returnType && returnType.toUpperCase() !== 'VOID') {
      const returnTypeDef = typeRegistry.getType(returnType, language);
      typeDefinitions.set('__return__', { ...returnTypeDef, isReturn: true });
      if (returnTypeDef.library) {
        uniqueLibs.add(returnTypeDef.library);
      }
    }

    // 3. Parse library references to extract { structure, version }
    for (const libPath of uniqueLibs) {
      const parts = libPath.split('/');
      if (parts.length >= 2) {
        const structure = parts[0];
        const version = parts[1];
        runtimes.push({ structure, version });
      }
    }

    return {
      runtimes,
      typeDefinitions
    };
  }
}

module.exports = new DependencyResolver();
