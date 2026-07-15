const fs = require('fs');
const path = require('path');
const languageRegistry = require('./languageRegistry');

class DriverRegistry {
  constructor() {
    this.driversDir = path.join(__dirname, '../registry/drivers');
    this.cache = new Map(); // Key: "category:language", Value: template string
    this.categories = new Set();
    this.languages = new Set();
    this.loadAllDrivers();
  }

  /**
   * Scans src/registry/drivers/ dynamically and caches template files.
   */
  loadAllDrivers() {
    try {
      if (!fs.existsSync(this.driversDir)) {
        return;
      }

      const categoryDirs = fs.readdirSync(this.driversDir);
      for (const catDir of categoryDirs) {
        const catPath = path.join(this.driversDir, catDir);
        
        if (fs.statSync(catPath).isDirectory()) {
          const category = catDir.toUpperCase();
          this.categories.add(category);

          const templateFiles = fs.readdirSync(catPath);
          for (const file of templateFiles) {
            if (file.endsWith('.template')) {
              const langId = path.basename(file, '.template').toLowerCase();
              
              // Validate that the language is supported in the LanguageRegistry
              if (!languageRegistry.hasLanguage(langId)) {
                throw new Error(`Driver template validation failed in '${catDir}/${file}': language '${langId}' is not registered in the LanguageRegistry.`);
              }

              const filePath = path.join(catPath, file);
              const templateContent = fs.readFileSync(filePath, 'utf8');

              // Strict validation: templates must not be empty
              if (!templateContent || templateContent.trim() === '') {
                throw new Error(`Driver template validation failed: template file '${catDir}/${file}' is empty.`);
              }

              const cacheKey = this.buildKey(category, langId);
              this.cache.set(cacheKey, templateContent);
              this.languages.add(langId);
            }
          }
        }
      }
    } catch (error) {
      console.error('Fatal: Failed to load driver templates:', error);
      throw error;
    }
  }

  /**
   * Helper to construct unique cache key.
   */
  buildKey(category, language) {
    return `${category.toLowerCase()}:${language.toLowerCase()}`;
  }

  clearCache() {
    this.cache.clear();
    this.categories.clear();
    this.languages.clear();
  }

  /**
   * Clears cache and reloads drivers.
   */
  reload() {
    this.clearCache();
    this.loadAllDrivers();
  }

  getSupportedCategories() {
    return Array.from(this.categories);
  }

  getSupportedLanguages() {
    return Array.from(this.languages).map(l => l.toLowerCase());
  }

  /**
   * Checks if driver exists for category and language.
   */
  hasDriver(category, language) {
    if (!category || !language) return false;
    return this.cache.has(this.buildKey(category, language));
  }

  /**
   * Returns template content string.
   */
  getDriver(category, language) {
    if (!category || !language) {
      throw new Error('Both category and language are required to resolve a driver.');
    }

    const key = this.buildKey(category, language);
    if (!this.cache.has(key)) {
      throw new Error(`Driver template for category '${category}' and language '${language}' is not registered.`);
    }

    return this.cache.get(key);
  }
}

module.exports = new DriverRegistry();
