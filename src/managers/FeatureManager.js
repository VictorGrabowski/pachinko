import { FEATURES } from '../config/featureConfig.js';
import StateManager from './StateManager.js';

/**
 * FeatureManager - Centralized feature configuration system
 * 
 * This singleton manages all game features and their parameters.
 * Features are loaded from featureConfig.js and can be toggled/configured at runtime.
 * Settings are persisted using StateManager.
 * 
 * Usage:
 *   FeatureManager.init();
 *   const enabled = FeatureManager.isEnabled('creature');
 *   const speed = FeatureManager.getParameter('creature', 'speed');
 *   FeatureManager.setParameter('creature', 'speed', 150);
 */
class FeatureManagerClass {
  constructor() {
    this.features = new Map();
    this.stateManager = new StateManager();
    this.initialized = false;
  }

  /**
   * Initialize the feature manager
   * Loads feature definitions and merges with saved settings
   */
  init() {
    if (this.initialized) {
      return;
    }

    // Load feature definitions from config
    this.loadFeatures(FEATURES);

    // Load saved settings from localStorage
    const savedConfig = this.stateManager.getFeatureConfig();
    if (savedConfig) {
      this.mergeWithSaved(savedConfig);
    }

    this.initialized = true;
    console.log('[FeatureManager] Initialized with', this.features.size, 'features');
  }

  /**
   * Load feature definitions into the manager
   * @param {Array} featureDefinitions - Array of feature objects from featureConfig
   */
  loadFeatures(featureDefinitions) {
    featureDefinitions.forEach(featureDef => {
      const feature = {
        ...featureDef,
        enabled: featureDef.enabled,
        parameterValues: {}
      };

      // Initialize parameter values with defaults
      if (featureDef.parameters) {
        featureDef.parameters.forEach(param => {
          feature.parameterValues[param.key] = param.default;
        });
      }

      this.features.set(featureDef.id, feature);
    });
  }

  /**
   * Merge saved configuration with current features
   * @param {Object} savedConfig - Saved configuration from localStorage
   */
  mergeWithSaved(savedConfig) {
    Object.keys(savedConfig).forEach(featureId => {
      const feature = this.features.get(featureId);
      if (feature && savedConfig[featureId]) {
        // Restore enabled state
        if (typeof savedConfig[featureId].enabled !== 'undefined') {
          feature.enabled = savedConfig[featureId].enabled;
        }

        // Restore parameter values
        if (savedConfig[featureId].parameters) {
          Object.keys(savedConfig[featureId].parameters).forEach(paramKey => {
            if (feature.parameterValues.hasOwnProperty(paramKey)) {
              feature.parameterValues[paramKey] = savedConfig[featureId].parameters[paramKey];
            }
          });
        }
      }
    });
  }

  /**
   * Check if a feature is enabled
   * @param {string} featureId - Feature identifier
   * @returns {boolean} True if feature is enabled
   */
  isEnabled(featureId) {
    const feature = this.features.get(featureId);
    return feature ? feature.enabled : false;
  }

  /**
   * Get a parameter value for a feature
   * @param {string} featureId - Feature identifier
   * @param {string} paramKey - Parameter key
   * @returns {any} Parameter value or undefined
   */
  getParameter(featureId, paramKey) {
    const feature = this.features.get(featureId);
    if (!feature || !feature.parameterValues) {
      return undefined;
    }
    return feature.parameterValues[paramKey];
  }

  /**
   * Set a parameter value for a feature
   * @param {string} featureId - Feature identifier
   * @param {string} paramKey - Parameter key
   * @param {any} value - New value
   */
  setParameter(featureId, paramKey, value) {
    const feature = this.features.get(featureId);
    if (!feature || !feature.parameterValues.hasOwnProperty(paramKey)) {
      console.warn(`[FeatureManager] Unknown parameter: ${featureId}.${paramKey}`);
      return;
    }

    // Validate and clamp number values
    const paramDef = feature.parameters.find(p => p.key === paramKey);
    if (paramDef && paramDef.type === 'number') {
      value = Math.max(paramDef.min, Math.min(paramDef.max, value));
    }

    feature.parameterValues[paramKey] = value;
  }

  /**
   * Toggle a feature on/off
   * @param {string} featureId - Feature identifier
   */
  toggleFeature(featureId) {
    const feature = this.features.get(featureId);
    if (feature) {
      feature.enabled = !feature.enabled;
    }
  }

  /**
   * Set feature enabled state
   * @param {string} featureId - Feature identifier
   * @param {boolean} enabled - Enabled state
   */
  setEnabled(featureId, enabled) {
    const feature = this.features.get(featureId);
    if (feature) {
      feature.enabled = enabled;
    }
  }

  /**
   * Get all features with their current state
   * @returns {Array} Array of feature objects with current values
   */
  getAllFeatures() {
    const features = [];
    this.features.forEach((feature, id) => {
      features.push({
        ...feature,
        id
      });
    });
    return features;
  }

  /**
   * Get features grouped by category
   * @returns {Object} Object with category keys and feature arrays
   */
  getFeaturesByCategory() {
    const grouped = {};
    this.features.forEach((feature, id) => {
      const category = feature.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        ...feature,
        id
      });
    });
    return grouped;
  }

  /**
   * Save current configuration to localStorage
   */
  saveConfig() {
    const config = {};
    
    this.features.forEach((feature, id) => {
      config[id] = {
        enabled: feature.enabled,
        parameters: { ...feature.parameterValues }
      };
    });

    this.stateManager.saveFeatureConfig(config);
    console.log('[FeatureManager] Configuration saved');
  }

  /**
   * Reset all features to default values
   */
  resetToDefaults() {
    this.features.clear();
    this.loadFeatures(FEATURES);
    this.saveConfig();
    console.log('[FeatureManager] Reset to defaults');
  }

  /**
   * Get feature definition (including parameter definitions)
   * @param {string} featureId - Feature identifier
   * @returns {Object} Feature object with definition
   */
  getFeature(featureId) {
    return this.features.get(featureId);
  }
}

// Export singleton instance
const FeatureManager = new FeatureManagerClass();
export default FeatureManager;
