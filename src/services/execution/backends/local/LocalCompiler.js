const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class LocalCompiler {
  /**
   * Compiles source code to a runnable binary or registers scripts.
   * @param {string} sourceCode
   * @param {string} language
   * @param {Object} options
   * @returns {Object} CompilationResult
   */
  compile(sourceCode, language, options = {}) {
    const buildDir = path.join(__dirname, '../../../../../builds');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    const fileId = `${language}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const ext = language === 'cpp' ? 'cpp' : (language === 'python' ? 'py' : 'js');
    const srcPath = path.join(buildDir, `${fileId}.${ext}`);
    fs.writeFileSync(srcPath, sourceCode, 'utf8');

    const artifact = {
      type: language === 'cpp' ? 'binary' : 'script',
      location: srcPath,
      metadata: { srcPath }
    };

    const compileResult = {
      success: true,
      artifact,
      stderr: '',
      compileTimeMs: 0
    };

    if (language === 'cpp') {
      const outPath = path.join(buildDir, `${fileId}${process.platform === 'win32' ? '.exe' : ''}`);
      const start = Date.now();
      try {
        // Compile using host standard compiler command
        execSync(`g++ -O3 -std=c++17 "${srcPath}" -o "${outPath}"`, { stdio: 'pipe' });
        compileResult.artifact.location = outPath;
        compileResult.artifact.type = 'binary';
        compileResult.compileTimeMs = Date.now() - start;
      } catch (e) {
        compileResult.success = false;
        compileResult.stderr = e.stderr ? e.stderr.toString() : e.message;
        compileResult.compileTimeMs = Date.now() - start;
      }
    }

    return compileResult;
  }
}

module.exports = new LocalCompiler();
