import FeatureManager from '../managers/FeatureManager.js';

/**
 * Audio System - manages game audio with Ma (間) concept
 * Implements strategic silence and respectful sound design
 */
export default class AudioSystem {
  constructor(scene) {
    this.scene = scene;
    this.sounds = new Map();
    this.soundConfigs = new Map(); // Store configs for creating new instances
    this.lastPlayTime = new Map();
    
    // Get Ma interval from FeatureManager if available
    this.maInterval = FeatureManager.getParameter('sounds', 'maInterval') || 150;
    this.enabled = FeatureManager.isEnabled('sounds');
    this.allowOverlap = FeatureManager.getParameter('sounds', 'allowOverlap') || false;
    
    // Set master volume from FeatureManager
    const volume = FeatureManager.getParameter('sounds', 'volume');
    if (volume !== undefined) {
      this.setVolume(volume);
    }
  }

  /**
   * Register a sound for later use
   */
  register(key, config = {}) {
    if (!this.scene.sound) return;
    
    const sound = this.scene.sound.add(key, config);
    this.sounds.set(key, sound);
    this.soundConfigs.set(key, config); // Store config for later use
    this.lastPlayTime.set(key, 0);
    return sound;
  }

  /**
   * Play a sound with Ma (間) consideration or allow overlap
   */
  play(key, config = {}) {
    if (!this.enabled) return;
    
    // If overlap is allowed for this sound (e.g., pin hits), create new instance
    if (this.allowOverlap && key === 'coin') {
      // Merge stored config with runtime config
      const storedConfig = this.soundConfigs.get(key) || {};
      const finalConfig = { ...storedConfig, ...config };
      // Use scene.sound.play() to create a new sound instance each time
      this.scene.sound.play(key, finalConfig);
      return true;
    }
    
    const sound = this.sounds.get(key);
    if (!sound) return;
    
    const now = this.scene.time.now;
    const lastPlay = this.lastPlayTime.get(key);
    
    // Implement ma (間) - respect silence between sounds
    if (now - lastPlay > this.maInterval) {
      sound.play(config);
      this.lastPlayTime.set(key, now);
      return true;
    }
    return false;
  }

  /**
   * Play sound after intentional delay (dramatic ma)
   */
  playDelayed(key, delay, config = {}) {
    this.scene.time.delayedCall(delay, () => {
      this.play(key, config);
    });
  }

  /**
   * Stop a specific sound
   */
  stop(key) {
    const sound = this.sounds.get(key);
    if (sound) {
      sound.stop();
    }
  }

  /**
   * Stop all sounds
   */
  stopAll() {
    this.sounds.forEach(sound => sound.stop());
  }

  /**
   * Toggle audio on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopAll();
    }
    return this.enabled;
  }

  /**
   * Set master volume
   */
  setVolume(volume) {
    if (this.scene.sound.volume !== undefined) {
      this.scene.sound.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Update allowOverlap setting
   */
  setAllowOverlap(value) {
    this.allowOverlap = value;
  }

  /**
   * Clean up
   */
  destroy() {
    this.stopAll();
    this.sounds.clear();
    this.lastPlayTime.clear();
  }
}
