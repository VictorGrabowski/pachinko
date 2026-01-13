/**
 * Global Score Manager - handles interaction with cloud backend (Supabase)
 * Falls back to local storage if global mode is disabled or keys are missing
 */
import { BACKEND_CONFIG } from '../config/backendConfig.js';
import stateManager from './StateManager.js';

class GlobalScoreManager {
    constructor() {
        this.isEnabled = BACKEND_CONFIG.USE_GLOBAL_LEADERBOARD &&
            BACKEND_CONFIG.SUPABASE_URL &&
            BACKEND_CONFIG.SUPABASE_ANON_KEY;

        if (this.isEnabled) {
            console.log('Global Leaderboard: Enabled');
        } else {
            console.log('Global Leaderboard: Disabled (Running in local mode)');
        }
    }

    /**
     * Fetch top scores from global backend or local storage
     * @returns {Promise<Array>} Array of score entries
     */
    async fetchTopScores() {
        if (!this.isEnabled) {
            // Fallback to local scores
            return stateManager.getTopScores(BACKEND_CONFIG.MAX_TOP_SCORES);
        }

        try {
            const response = await fetch(`${BACKEND_CONFIG.SUPABASE_URL}/rest/v1/${BACKEND_CONFIG.TABLE_NAME}?select=*&order=score.desc&limit=${BACKEND_CONFIG.MAX_TOP_SCORES}`, {
                method: 'GET',
                headers: {
                    'apikey': BACKEND_CONFIG.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${BACKEND_CONFIG.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }

            const data = await response.json();
            return data.map(entry => ({
                username: entry.username,
                score: entry.score,
                date: entry.created_at || entry.date
            }));
        } catch (error) {
            console.error('Global Leaderboard Error (Fetch):', error);
            // Fallback to local on error
            return stateManager.getTopScores(BACKEND_CONFIG.MAX_TOP_SCORES);
        }
    }

    /**
     * Submit a new score to the global backend
     * @param {string} username - Player name
     * @param {number} score - Achievement score
     * @returns {Promise<boolean>} Success status
     */
    async submitScore(username, score) {
        // Always save locally first
        stateManager.saveScoreEntry({
            username,
            score,
            date: new Date().toISOString()
        });

        if (!this.isEnabled) return true;

        try {
            const response = await fetch(`${BACKEND_CONFIG.SUPABASE_URL}/rest/v1/${BACKEND_CONFIG.TABLE_NAME}`, {
                method: 'POST',
                headers: {
                    'apikey': BACKEND_CONFIG.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${BACKEND_CONFIG.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    username: username.trim(),
                    score: Math.floor(score),
                    date: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to submit: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('Global Leaderboard Error (Submit):', error);
            return false;
        }
    }

    /**
     * Check if global mode is active
     */
    isGlobalActive() {
        return this.isEnabled;
    }
}

const globalScoreManager = new GlobalScoreManager();
export default globalScoreManager;
