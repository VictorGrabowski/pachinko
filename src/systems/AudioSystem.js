/**
 * Audio System - manages game audio with Ma (間) concept
 * Implements strategic silence and respectful sound design
 */
export default class AudioSystem {
  constructor(scene) {
    this.scene = scene;
    this.sounds = new Map();
    this.lastPlayTime = new Map();
    this.maInterval = 150; // Minimum silence between sounds (ma concept)
    this.enabled = true;
  }

  /**
   * Register a sound for later use
   */
  register(key, config = {}) {
    if (!this.scene.sound) return;
    
    const sound = this.scene.sound.add(key, config);
    this.sounds.set(key, sound);
    this.lastPlayTime.set(key, 0);
    return sound;
  }

  /**
   * Play a sound with Ma (間) consideration
   */
  play(key, config = {}) {
    if (!this.enabled) return;
    
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
   * Clean up
   */
  destroy() {
    this.stopAll();
    this.sounds.clear();
    this.lastPlayTime.clear();
  }
}
