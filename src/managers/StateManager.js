/**
 * State Manager - manages game state persistence
 */
export default class StateManager {
  constructor() {
    this.storageKey = 'pachinko_game_state';
  }

  /**
   * Save high score
   */
  saveHighScore(score) {
    const currentHigh = this.getHighScore();
    if (score > currentHigh) {
      localStorage.setItem(`${this.storageKey}_high_score`, score.toString());
      return true;
    }
    return false;
  }

  /**
   * Get high score
   */
  getHighScore() {
    const stored = localStorage.getItem(`${this.storageKey}_high_score`);
    return stored ? parseInt(stored, 10) : 0;
  }

  /**
   * Save game statistics
   */
  saveStats(stats) {
    try {
      localStorage.setItem(`${this.storageKey}_stats`, JSON.stringify(stats));
      return true;
    } catch (e) {
      console.error('Failed to save stats:', e);
      return false;
    }
  }

  /**
   * Get game statistics
   */
  getStats() {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_stats`);
      return stored ? JSON.parse(stored) : this.getDefaultStats();
    } catch (e) {
      console.error('Failed to load stats:', e);
      return this.getDefaultStats();
    }
  }

  /**
   * Get default statistics object
   */
  getDefaultStats() {
    return {
      gamesPlayed: 0,
      totalScore: 0,
      highestCombo: 0,
      totalBallsLaunched: 0
    };
  }

  /**
   * Clear all saved data
   */
  clearAll() {
    localStorage.removeItem(`${this.storageKey}_high_score`);
    localStorage.removeItem(`${this.storageKey}_stats`);
  }
}
