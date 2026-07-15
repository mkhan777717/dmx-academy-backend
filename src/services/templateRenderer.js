class TemplateRenderer {
  /**
   * Safely replaces placeholder tags in a template content string.
   * Uses deterministic split-join to preserve user code formatting and special character symbols.
   * @param {string} template - Raw template file content
   * @param {Object} variables - Dictionary of replacements e.g. { "{{USER_CODE}}": "function solve() { ... }" }
   * @returns {string} Assembled output
   */
  render(template, variables = {}) {
    if (!template) {
      return '';
    }

    let result = template;
    for (const [placeholder, value] of Object.entries(variables)) {
      const stringValue = value !== undefined && value !== null ? String(value) : '';
      
      // Split-join strategy avoids JavaScript's String.prototype.replace() regex matching anomalies
      result = result.split(placeholder).join(stringValue);
    }
    return result;
  }
}

module.exports = new TemplateRenderer();
