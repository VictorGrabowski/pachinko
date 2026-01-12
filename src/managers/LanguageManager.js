/**
 * Language Manager - Manages game localization and translations
 * Singleton pattern for centralized language management
 */
import stateManager from './StateManager.js';
import { TRANSLATIONS } from '../config/gameConfig.js';

class LanguageManager {
  constructor() {
    if (LanguageManager.instance) {
      return LanguageManager.instance;
    }
    
    this.stateManager = stateManager;
    this.currentLanguage = this.stateManager.getLanguagePreference() || 'fr';
    this.translations = TRANSLATIONS;
    this.listeners = [];
    
    LanguageManager.instance = this;
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!LanguageManager.instance) {
      LanguageManager.instance = new LanguageManager();
    }
    return LanguageManager.instance;
  }

  /**
   * Set current language
   * @param {string} languageCode - Language code (e.g., 'fr', 'en')
   */
  setLanguage(languageCode) {
    if (this.translations[languageCode]) {
      this.currentLanguage = languageCode;
      this.stateManager.saveLanguagePreference(languageCode);
      this.notifyListeners();
      return true;
    }
    console.warn(`Language '${languageCode}' not available, keeping '${this.currentLanguage}'`);
    return false;
  }

  /**
   * Get current language code
   * @returns {string} Current language code
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get translated text by key path
   * @param {string} keyPath - Dot-separated key path (e.g., 'menu.title', 'scoreboard.rank')
   * @param {string} fallbackLanguage - Fallback language if key not found (default: 'fr')
   * @returns {string} Translated text or key path if not found
   */
  getText(keyPath, fallbackLanguage = 'fr') {
    const keys = keyPath.split('.');
    let current = this.translations[this.currentLanguage];
    
    // Try to find key in current language
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Key not found, try fallback
        if (this.currentLanguage !== fallbackLanguage) {
          current = this.translations[fallbackLanguage];
          for (const fallbackKey of keys) {
            if (current && typeof current === 'object' && fallbackKey in current) {
              current = current[fallbackKey];
            } else {
              return `[${keyPath}]`; // Not found in fallback either
            }
          }
          return current;
        }
        return `[${keyPath}]`; // Not found
      }
    }
    
    return current;
  }

  /**
   * Get all available language codes
   * @returns {string[]} Array of language codes
   */
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }

  /**
   * Get language display name
   * @param {string} languageCode - Language code
   * @returns {string} Display name or code if not found
   */
  getLanguageName(languageCode) {
    const names = {
      fr: 'Français',
      en: 'English',
      ja: '日本語',
      es: 'Español',
      de: 'Deutsch'
    };
    return names[languageCode] || languageCode;
  }

  /**
   * Register listener for language change events
   * @param {Function} callback - Callback function to execute on language change
   */
  onLanguageChanged(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  /**
   * Remove language change listener
   * @param {Function} callback - Callback function to remove
   */
  offLanguageChanged(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
   * Notify all listeners of language change
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentLanguage);
      } catch (e) {
        console.error('Error in language change listener:', e);
      }
    });
  }

  /**
   * Detect browser language and set if available
   * @returns {string} Detected language code
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0]; // 'fr-FR' -> 'fr'
    
    if (this.translations[langCode]) {
      return langCode;
    }
    return 'fr'; // Default fallback
  }

  /**
   * Initialize with browser language if no preference saved
   */
  initializeLanguage() {
    if (!this.stateManager.getLanguagePreference()) {
      const detectedLang = this.detectBrowserLanguage();
      this.setLanguage(detectedLang);
    }
  }
}

// Export singleton instance
export default LanguageManager.getInstance();
