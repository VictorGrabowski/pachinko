/**
 * ServiceLocator - Dependency Injection Container
 * 
 * Centralizes service registration and retrieval to avoid direct singleton imports.
 * This enables easier testing (mock injection) and loose coupling between modules.
 * 
 * Usage:
 *   // In main.js or boot scene:
 *   ServiceLocator.register('featureManager', FeatureManager);
 *   ServiceLocator.register('audioSystem', new AudioSystem(game));
 * 
 *   // In any module:
 *   const featureManager = ServiceLocator.get('featureManager');
 * 
 * @module core/ServiceLocator
 */

class ServiceLocator {
    /**
     * Internal storage for registered services
     * @type {Map<string, any>}
     */
    static #services = new Map();

    /**
     * Register a service with the locator
     * @param {string} key - Unique identifier for the service
     * @param {any} service - The service instance or class
     * @returns {void}
     */
    static register(key, service) {
        if (this.#services.has(key)) {
            console.warn(`[ServiceLocator] Overwriting existing service: ${key}`);
        }
        this.#services.set(key, service);
    }

    /**
     * Retrieve a registered service
     * @param {string} key - The service identifier
     * @returns {any} The registered service
     * @throws {Error} If service is not found
     */
    static get(key) {
        if (!this.#services.has(key)) {
            throw new Error(`[ServiceLocator] Service not found: ${key}`);
        }
        return this.#services.get(key);
    }

    /**
     * Check if a service is registered
     * @param {string} key - The service identifier
     * @returns {boolean}
     */
    static has(key) {
        return this.#services.has(key);
    }

    /**
     * Remove a registered service
     * @param {string} key - The service identifier
     * @returns {boolean} True if service was removed
     */
    static unregister(key) {
        return this.#services.delete(key);
    }

    /**
     * Clear all registered services (useful for tests)
     * @returns {void}
     */
    static clear() {
        this.#services.clear();
    }

    /**
     * Get all registered service keys (useful for debugging)
     * @returns {string[]}
     */
    static getRegisteredKeys() {
        return Array.from(this.#services.keys());
    }
}

export default ServiceLocator;
