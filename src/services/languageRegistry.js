const fs = require('fs');
const path = require('path');

class LanguageRegistry {
  constructor() {
    this.languagesDir = path.join(__dirname, '../registry/languages');
    this.cache = new Map();
    this.loadAllLanguages();
  }

  /**
   * Loads and validates all language configuration JSON files on startup.
   */
  loadAllLanguages() {
    try {
      if (!fs.existsSync(this.languagesDir)) {
        return;
      }
      const files = fs.readdirSync(this.languagesDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.languagesDir, file);
          const rawData = fs.readFileSync(filePath, 'utf8');
          const config = JSON.parse(rawData);

          // Validation (Fail Fast)
          this.validateConfig(file, config);

          const langId = config.language.toLowerCase();
          this.cache.set(langId, config);
        }
      }
    } catch (error) {
      console.error('Fatal: Failed to load language registry:', error);
      throw error;
    }
  }

  /**
   * Strictly validates language schema fields.
   */
  validateConfig(filename, config) {
    if (!config.language || typeof config.language !== 'string' || config.language.trim() === '') {
      throw new Error(`Language config validation failed in '${filename}': 'language' string is required.`);
    }
    if (!config.extension || typeof config.extension !== 'string' || config.extension.trim() === '') {
      throw new Error(`Language config validation failed in '${filename}': 'extension' string is required.`);
    }
    if (typeof config.needsCompile !== 'boolean') {
      throw new Error(`Language config validation failed in '${filename}': 'needsCompile' boolean is required.`);
    }
    if (!config.runCmd || typeof config.runCmd !== 'string' || config.runCmd.trim() === '') {
      throw new Error(`Language config validation failed in '${filename}': 'runCmd' string is required.`);
    }
    if (config.needsCompile) {
      if (!config.compileCmd || typeof config.compileCmd !== 'string' || config.compileCmd.trim() === '') {
        throw new Error(`Language config validation failed in '${filename}': 'compileCmd' is required when 'needsCompile' is true.`);
      }
    }
  }

  /**
   * Clears and re-reads configurations. Uses double-buffering for concurrent safety.
   */
  reload() {
    const newRegistry = new LanguageRegistry();
    this.cache = newRegistry.cache;
  }

  /**
   * Checks if language exists.
   */
  hasLanguage(id) {
    if (!id) return false;
    return this.cache.has(id.toLowerCase());
  }

  /**
   * Retrieves full language config object.
   */
  getLanguage(id) {
    if (!id) {
      throw new Error('Language ID is required.');
    }
    const key = id.toLowerCase();
    if (!this.cache.has(key)) {
      throw new Error(`Language '${id}' is not registered.`);
    }
    return this.cache.get(key);
  }

  getCompileCommand(id) {
    return this.getLanguage(id).compileCmd;
  }

  getRunCommand(id) {
    return this.getLanguage(id).runCmd;
  }

  getExtension(id) {
    return this.getLanguage(id).extension;
  }
}

module.exports = new LanguageRegistry();
