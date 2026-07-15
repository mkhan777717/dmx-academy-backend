const fs = require('fs');
const path = require('path');

class TypeRegistry {
  constructor() {
    this.typesDir = path.join(__dirname, '../registry/types');
    this.cache = new Map();
    this.loadAllTypes();
  }

  /**
   * Reads all registered JSON configs inside src/registry/types/
   */
  loadAllTypes() {
    try {
      if (!fs.existsSync(this.typesDir)) {
        return;
      }
      const files = fs.readdirSync(this.typesDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.typesDir, file);
          const rawData = fs.readFileSync(filePath, 'utf8');
          const typeData = JSON.parse(rawData);
          if (typeData.name) {
            this.cache.set(typeData.name.toLowerCase(), typeData);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load type registry configs:', error);
    }
  }

  /**
   * Refreshes the cache (useful for runtime additions / dynamic testing)
   */
  refresh() {
    this.cache.clear();
    this.loadAllTypes();
  }

  /**
   * Checks if a type is registered
   * @param {string} typeName 
   * @returns {boolean}
   */
  hasType(typeName) {
    if (!typeName) return false;
    return this.cache.has(typeName.toLowerCase());
  }

  /**
   * Retrieves all type names loaded in the registry
   * @returns {Array<string>}
   */
  getAllTypes() {
    return Array.from(this.cache.keys()).map(k => k.toUpperCase());
  }

  /**
   * Resolves language-specific details for a registered datatype
   * @param {string} typeName - e.g. "INT", "TreeNode"
   * @param {string} language - e.g. "cpp", "python"
   * @returns {Object} { typeName, library, deserialize, serialize, cleanup }
   */
  getType(typeName, language) {
    if (!typeName || !language) {
      throw new Error('Both typeName and language are required to lookup Type Registry.');
    }

    const typeKey = typeName.toLowerCase();
    if (!this.cache.has(typeKey)) {
      throw new Error(`Data type '${typeName}' is not registered in the Type Registry.`);
    }

    const typeData = this.cache.get(typeKey);
    const langKey = language.toLowerCase();
    const langDef = typeData.languages[langKey];

    if (!langDef) {
      throw new Error(`Data type '${typeName}' has no configuration defined for language '${language}'.`);
    }

    return {
      typeName: langDef.typeName,
      library: langDef.library || null,
      deserialize: langDef.deserialize,
      serialize: langDef.serialize,
      cleanup: langDef.cleanup || null
    };
  }
}

module.exports = new TypeRegistry();
