const LocalBackend = require('./local/LocalBackend');
const DockerBackend = require('./docker/DockerBackend');
const PistonBackend = require('./piston/PistonBackend');

class BackendRegistry {
  constructor() {
    this.registry = new Map();
    this.loadDefaultBackends();
  }

  loadDefaultBackends() {
    this.registerBackend('local', new LocalBackend());
    this.registerBackend('docker', new DockerBackend());
    this.registerBackend('piston', new PistonBackend());
  }

  /**
   * Registers a new execution backend.
   * @param {string} id
   * @param {Object} backendInstance
   */
  registerBackend(id, backendInstance) {
    if (!id || !backendInstance) {
      throw new Error('Backend ID and instantiated adapter are required.');
    }
    this.registry.set(id.toLowerCase(), backendInstance);
  }

  hasBackend(id) {
    if (!id) return false;
    return this.registry.has(id.toLowerCase());
  }

  getBackend(id) {
    if (!id) {
      throw new Error('Backend ID is required.');
    }
    const key = id.toLowerCase();
    if (!this.registry.has(key)) {
      throw new Error(`Execution backend "${id}" is not registered.`);
    }
    return this.registry.get(key);
  }

  reload() {
    this.registry.clear();
    this.loadDefaultBackends();
  }

  async health() {
    for (const [id, backend] of this.registry.entries()) {
      const ok = await backend.health();
      if (!ok) {
        console.warn(`Health check warning: Backend '${id}' is not fully healthy.`);
      }
    }
    return true;
  }
}

module.exports = new BackendRegistry();
