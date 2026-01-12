/**
 * State Manager - manages game state persistence
 * Singleton pattern for centralized state management
 */
class StateManager {
  constructor() {
    if (StateManager.instance) {
      return StateManager.instance;
    }
    this.storageKey = 'pachinko_game_state';
    StateManager.instance = this;
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
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
   * Save feature configuration
   */
  saveFeatureConfig(config) {
    try {
      localStorage.setItem(`${this.storageKey}_features`, JSON.stringify(config));
      return true;
    } catch (e) {
      console.error('Failed to save feature config:', e);
      return false;
    }
  }

  /**
   * Get feature configuration
   */
  getFeatureConfig() {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_features`);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to load feature config:', e);
      return null;
    }
  }

  /**
   * Clear all saved data
   */
  clearAll() {
    localStorage.removeItem(`${this.storageKey}_high_score`);
    localStorage.removeItem(`${this.storageKey}_stats`);
    localStorage.removeItem(`${this.storageKey}_features`);
  }

  /**
   * Save language preference
   * @param {string} languageCode - Language code (e.g., 'fr', 'en')
   */
  saveLanguagePreference(languageCode) {
    try {
      localStorage.setItem(`${this.storageKey}_language`, languageCode);
      return true;
    } catch (e) {
      console.error('Failed to save language preference:', e);
      return false;
    }
  }

  /**
   * Get language preference
   * @returns {string|null} Language code or null if not set
   */
  getLanguagePreference() {
    return localStorage.getItem(`${this.storageKey}_language`);
  }

  /**
   * Save a score entry to the scoreboard (maintains top 10 only)
   * @param {Object} entry - Score entry {username, score, date}
   * @returns {boolean} Success status
   */
  saveScoreEntry(entry) {
    try {
      const { username, score, date } = entry;
      
      if (!username || typeof score !== 'number' || !date) {
        console.error('Invalid score entry:', entry);
        return false;
      }

      let scoreboard = this.getTopScores();
      
      // Add new entry
      scoreboard.push({
        username: username.trim(),
        score: score,
        date: date
      });

      // Sort by score descending
      scoreboard.sort((a, b) => b.score - a.score);

      // Keep only top 10
      scoreboard = scoreboard.slice(0, 10);

      // Save to localStorage
      localStorage.setItem(`${this.storageKey}_scoreboard`, JSON.stringify(scoreboard));
      return true;
    } catch (e) {
      console.error('Failed to save score entry:', e);
      return false;
    }
  }

  /**
   * Get top scores from scoreboard
   * @param {number} limit - Maximum number of scores to return (default: 10)
   * @returns {Array} Array of score entries sorted by score descending
   */
  getTopScores(limit = 10) {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_scoreboard`);
      const scoreboard = stored ? JSON.parse(stored) : [];
      
      // Sort by score descending and limit
      return scoreboard
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (e) {
      console.error('Failed to load scoreboard:', e);
      return [];
    }
  }

  /**
   * Clear all scoreboard entries
   * @returns {boolean} Success status
   */
  clearScoreboard() {
    try {
      localStorage.removeItem(`${this.storageKey}_scoreboard`);
      return true;
    } catch (e) {
      console.error('Failed to clear scoreboard:', e);
      return false;
    }
  }

  /**
   * Check if a score would make it into the top 10
   * @param {number} score - Score to check
   * @returns {boolean} True if score would be in top 10
   */
  isTopScore(score) {
    const topScores = this.getTopScores();
    if (topScores.length < 10) return true;
    return score > topScores[topScores.length - 1].score;
  }

  /**
   * Get rank for a specific score
   * @param {number} score - Score to check
   * @returns {number|null} Rank (1-10) or null if not in top 10
   */
  getScoreRank(score) {
    const topScores = this.getTopScores();
    const rank = topScores.findIndex(entry => entry.score <= score);
    return rank !== -1 ? rank + 1 : null;
  }
}

// Export singleton instance
const stateManager = new StateManager();
export default stateManager;
