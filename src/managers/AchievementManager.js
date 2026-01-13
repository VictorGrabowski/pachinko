/**
 * AchievementManager - Manages achievements, daily challenges, and streaks
 * 
 * Features:
 * - Unlockable achievements with progress tracking
 * - Daily challenges that reset at midnight
 * - Login streak bonuses
 * - Tier/theme progression
 * 
 * @module managers/AchievementManager
 */

import EventBus, { GameEvents } from "../core/EventBus.js";
import stateManager from "./StateManager.js";
import FeatureManager from "./FeatureManager.js";

// Achievement definitions
const ACHIEVEMENTS = [
    // Combo achievements
    { id: 'combo_5', name: 'Combo Starter+', description: 'Reach a 6x combo', icon: '🔥', condition: { type: 'combo', value: 6 } },
    { id: 'combo_10', name: 'Combo Pro+', description: 'Reach a 11x combo', icon: '💥', condition: { type: 'combo', value: 11 } },
    { id: 'combo_20', name: 'Combo Master+', description: 'Reach a 21x combo', icon: '⚡', condition: { type: 'combo', value: 21 } },
    { id: 'combo_50', name: 'Combo Legend+', description: 'Reach a 51x combo', icon: '👑', condition: { type: 'combo', value: 51 } },

    // Score achievements
    { id: 'score_500', name: 'First Steps', description: 'Score 500 points in one game', icon: '🌱', condition: { type: 'score', value: 500 } },
    { id: 'score_2000', name: 'Rising Star', description: 'Score 2000 points in one game', icon: '⭐', condition: { type: 'score', value: 2000 } },
    { id: 'score_5000', name: 'High Roller', description: 'Score 5000 points in one game', icon: '💰', condition: { type: 'score', value: 5000 } },
    { id: 'score_10000', name: 'Jackpot King', description: 'Score 10000 points in one game', icon: '🏆', condition: { type: 'score', value: 10000 } },

    // Bucket achievements
    { id: 'bucket_10', name: 'Lucky Shot', description: 'Hit the x10 bucket', icon: '🎯', condition: { type: 'bucket', value: 10 } },
    { id: 'bucket_10_x3', name: 'Triple Jackpot', description: 'Hit the x10 bucket 3 times in one game', icon: '🎰', condition: { type: 'bucket_count', bucketValue: 10, count: 3 } },

    // Survival achievements
    { id: 'survive_10', name: 'Survivor', description: 'Launch 10 balls without losing one', icon: '🛡️', condition: { type: 'survive', value: 10 } },
    { id: 'survive_20', name: 'Immortal', description: 'Launch 20 balls without losing one', icon: '💎', condition: { type: 'survive', value: 20 } },

    // Golden ball achievements
    { id: 'golden_first', name: 'Golden Touch', description: 'Get your first golden ball', icon: '✨', condition: { type: 'golden', value: 1 } },
    { id: 'golden_5', name: 'Midas', description: 'Get 5 golden balls total', icon: '🌟', condition: { type: 'golden_total', value: 5 } },

    // Special achievements
    { id: 'mystery_hit', name: 'Mystery Solver', description: 'Hit a mystery bucket', icon: '❓', condition: { type: 'mystery', value: 1 } },
    { id: 'lucky_zone', name: 'Fortune Seeker', description: 'Hit the lucky zone', icon: '🍀', condition: { type: 'lucky_zone', value: 1 } },

    // Streak achievements
    { id: 'streak_3', name: 'Regular Player', description: 'Play 3 days in a row', icon: '📅', condition: { type: 'streak', value: 3 } },
    { id: 'streak_7', name: 'Dedicated', description: 'Play 7 days in a row', icon: '🗓️', condition: { type: 'streak', value: 7 } },
];

// Daily challenge templates
const DAILY_CHALLENGES = [
    { id: 'daily_combo_10', description: 'Reach a 11x combo', condition: { type: 'combo', value: 11 }, reward: 100 },
    { id: 'daily_score_1000', description: 'Score 1000 points', condition: { type: 'score', value: 1000 }, reward: 150 },
    { id: 'daily_bucket_5', description: 'Hit the x5 bucket 3 times', condition: { type: 'bucket_count', bucketValue: 5, count: 3 }, reward: 120 },
    { id: 'daily_survive_5', description: 'Launch 5 balls without losing', condition: { type: 'survive', value: 5 }, reward: 80 },
    { id: 'daily_golden', description: 'Get a golden ball', condition: { type: 'golden', value: 1 }, reward: 200 },
];

// Tier progression
const TIER_CONFIG = [
    { score: 0, name: 'Débutant', theme: 'classic', icon: '🥉' },
    { score: 500, name: 'Amateur', theme: 'ocean', icon: '🥈' },
    { score: 1500, name: 'Apprenti', theme: 'forest', icon: '🥇' },
    { score: 3000, name: 'Expert', theme: 'sunset', icon: '💫' },
    { score: 5000, name: 'Maître', theme: 'midnight', icon: '👑' }
];

class AchievementManagerClass {
    constructor() {
        this.gameSession = this.createNewSession();
        this.unlockedAchievements = new Set();
        this.dailyChallenge = null;
        this.dailyChallengeProgress = 0;
        this.loginStreak = 0;
        this.lastLoginDate = null;
    }

    /**
     * Initialize the achievement manager
     */
    init() {
        this.loadSavedData();
        this.updateLoginStreak();
        this.generateDailyChallenge();
        this.setupEventListeners();
    }

    /**
     * Create a new game session tracking object
     */
    createNewSession() {
        return {
            score: 0,
            maxCombo: 0,
            ballsLaunched: 0,
            ballsSurvived: 0, // Consecutive balls without losing
            bucketHits: {}, // { bucketValue: count }
            goldenBalls: 0,
            mysteryHits: 0,
            luckyZoneHits: 0
        };
    }

    /**
     * Reset session for new game
     */
    resetSession() {
        this.gameSession = this.createNewSession();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        EventBus.on(GameEvents.SCORE_UPDATE, this.onScoreUpdate, this);
        EventBus.on(GameEvents.SCORE_COMBO, this.onComboUpdate, this);
        EventBus.on(GameEvents.BALL_LAUNCHED, this.onBallLaunched, this);
        EventBus.on(GameEvents.BALL_LOST, this.onBallLost, this);
        EventBus.on(GameEvents.BALL_HIT_BUCKET, this.onBucketHit, this);
        EventBus.on(GameEvents.GOLDEN_BALL_TRIGGERED, this.onGoldenBall, this);
        EventBus.on(GameEvents.MYSTERY_BUCKET_HIT, this.onMysteryHit, this);
        EventBus.on(GameEvents.LUCKY_ZONE_SPAWN, this.onLuckyZoneHit, this);
    }

    /**
     * Load saved achievement data
     */
    loadSavedData() {
        try {
            const saved = localStorage.getItem('pachinko_achievements');
            if (saved) {
                const data = JSON.parse(saved);
                this.unlockedAchievements = new Set(data.unlockedAchievements || []);
                this.loginStreak = data.loginStreak || 0;
                this.lastLoginDate = data.lastLoginDate || null;
                this.dailyChallenge = data.dailyChallenge || null;
                this.dailyChallengeProgress = data.dailyChallengeProgress || 0;
            }
        } catch (e) {
            console.error('Failed to load achievements:', e);
        }
    }

    /**
     * Save achievement data
     */
    saveData() {
        try {
            const data = {
                unlockedAchievements: Array.from(this.unlockedAchievements),
                loginStreak: this.loginStreak,
                lastLoginDate: this.lastLoginDate,
                dailyChallenge: this.dailyChallenge,
                dailyChallengeProgress: this.dailyChallengeProgress
            };
            localStorage.setItem('pachinko_achievements', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save achievements:', e);
        }
    }

    /**
     * Update login streak
     */
    updateLoginStreak() {
        const today = new Date().toISOString().split('T')[0];

        if (!this.lastLoginDate) {
            this.loginStreak = 1;
        } else {
            const lastDate = new Date(this.lastLoginDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                this.loginStreak++;
            } else if (diffDays > 1) {
                this.loginStreak = 1;
            }
            // diffDays === 0 means same day, don't change streak
        }

        this.lastLoginDate = today;
        this.checkStreakAchievements();
        this.saveData();

        EventBus.emit(GameEvents.STREAK_UPDATE, { streak: this.loginStreak });
    }

    /**
     * Generate daily challenge (changes at midnight)
     */
    generateDailyChallenge() {
        const today = new Date().toISOString().split('T')[0];

        // Check if we need a new challenge
        if (this.dailyChallenge && this.dailyChallenge.date === today) {
            return; // Keep existing challenge
        }

        // Use date as seed for consistent daily challenge
        const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
        const challengeIndex = seed % DAILY_CHALLENGES.length;

        this.dailyChallenge = {
            ...DAILY_CHALLENGES[challengeIndex],
            date: today,
            completed: false
        };
        this.dailyChallengeProgress = 0;
        this.saveData();
    }

    // ========== EVENT HANDLERS ==========

    onScoreUpdate(data) {
        this.gameSession.score = data.total || data.score || 0;
        this.checkScoreAchievements();
        this.checkTierProgress();
        this.updateDailyChallengeProgress('score', this.gameSession.score);
    }

    onComboUpdate(data) {
        const combo = data.combo || 0;
        if (combo > this.gameSession.maxCombo) {
            this.gameSession.maxCombo = combo;
            this.checkComboAchievements();
            this.updateDailyChallengeProgress('combo', combo);
        }
    }

    onBallLaunched() {
        this.gameSession.ballsLaunched++;
        this.gameSession.ballsSurvived++;
    }

    onBallLost() {
        this.gameSession.ballsSurvived = 0;
    }

    onBucketHit(data) {
        const value = data.value || data.bucketValue || 1;
        this.gameSession.bucketHits[value] = (this.gameSession.bucketHits[value] || 0) + 1;

        // Check survival after successful bucket hit
        this.checkSurvivalAchievements();
        this.checkBucketAchievements();
        this.updateDailyChallengeProgress('bucket_count', { bucketValue: value, count: this.gameSession.bucketHits[value] });
    }

    onGoldenBall() {
        this.gameSession.goldenBalls++;
        this.checkGoldenAchievements();
        this.updateDailyChallengeProgress('golden', this.gameSession.goldenBalls);
    }

    onMysteryHit() {
        this.gameSession.mysteryHits++;
        this.unlockAchievement('mystery_hit');
    }

    onLuckyZoneHit() {
        this.gameSession.luckyZoneHits++;
        this.unlockAchievement('lucky_zone');
    }

    // ========== ACHIEVEMENT CHECKS ==========

    checkComboAchievements() {
        const combo = this.gameSession.maxCombo;
        if (combo >= 6) this.unlockAchievement('combo_5');
        if (combo >= 11) this.unlockAchievement('combo_10');
        if (combo >= 21) this.unlockAchievement('combo_20');
        if (combo >= 51) this.unlockAchievement('combo_50');
    }

    checkScoreAchievements() {
        const score = this.gameSession.score;
        if (score >= 500) this.unlockAchievement('score_500');
        if (score >= 2000) this.unlockAchievement('score_2000');
        if (score >= 5000) this.unlockAchievement('score_5000');
        if (score >= 10000) this.unlockAchievement('score_10000');
    }

    checkBucketAchievements() {
        if (this.gameSession.bucketHits[10] >= 1) this.unlockAchievement('bucket_10');
        if (this.gameSession.bucketHits[10] >= 3) this.unlockAchievement('bucket_10_x3');
    }

    checkSurvivalAchievements() {
        const survived = this.gameSession.ballsSurvived;
        if (survived >= 10) this.unlockAchievement('survive_10');
        if (survived >= 20) this.unlockAchievement('survive_20');
    }

    checkGoldenAchievements() {
        if (this.gameSession.goldenBalls >= 1) this.unlockAchievement('golden_first');

        // Check total golden balls across all games
        const totalGolden = this.getTotalGoldenBalls();
        if (totalGolden >= 5) this.unlockAchievement('golden_5');
    }

    checkStreakAchievements() {
        if (this.loginStreak >= 3) this.unlockAchievement('streak_3');
        if (this.loginStreak >= 7) this.unlockAchievement('streak_7');
    }

    /**
     * Unlock an achievement
     * @param {string} achievementId 
     */
    unlockAchievement(achievementId) {
        if (!FeatureManager.isEnabled('achievements')) return;
        if (this.unlockedAchievements.has(achievementId)) return;

        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) return;

        this.unlockedAchievements.add(achievementId);
        this.saveData();

        EventBus.emit(GameEvents.ACHIEVEMENT_UNLOCKED, { achievement });
        console.log(`🏆 Achievement unlocked: ${achievement.name}`);
    }

    // ========== TIER PROGRESS ==========

    checkTierProgress() {
        const score = this.gameSession.score;
        let currentTier = TIER_CONFIG[0];
        let nextTier = TIER_CONFIG[1];

        for (let i = 0; i < TIER_CONFIG.length; i++) {
            if (score >= TIER_CONFIG[i].score) {
                currentTier = TIER_CONFIG[i];
                nextTier = TIER_CONFIG[i + 1] || null;
            }
        }

        const progress = nextTier
            ? (score - currentTier.score) / (nextTier.score - currentTier.score)
            : 1;

        EventBus.emit(GameEvents.TIER_PROGRESS_UPDATE, {
            currentTier,
            nextTier,
            progress: Math.min(1, Math.max(0, progress)),
            score
        });
    }

    // ========== DAILY CHALLENGE ==========

    updateDailyChallengeProgress(type, value) {
        if (!this.dailyChallenge || this.dailyChallenge.completed) return;

        const condition = this.dailyChallenge.condition;
        if (condition.type !== type) return;

        let completed = false;

        if (type === 'bucket_count') {
            if (value.bucketValue === condition.bucketValue && value.count >= condition.count) {
                completed = true;
            }
        } else if (typeof value === 'number' && value >= condition.value) {
            completed = true;
        }

        if (completed) {
            this.dailyChallenge.completed = true;
            this.saveData();
            EventBus.emit(GameEvents.CHALLENGE_COMPLETE, {
                challenge: this.dailyChallenge,
                reward: this.dailyChallenge.reward
            });
        }
    }

    // ========== GETTERS ==========

    getTotalGoldenBalls() {
        const stats = stateManager.getStats();
        return (stats.totalGoldenBalls || 0) + this.gameSession.goldenBalls;
    }

    getLoginStreak() {
        return this.loginStreak;
    }

    getDailyChallenge() {
        return this.dailyChallenge;
    }

    getUnlockedAchievements() {
        return Array.from(this.unlockedAchievements).map(id =>
            ACHIEVEMENTS.find(a => a.id === id)
        ).filter(Boolean);
    }

    getAllAchievements() {
        return ACHIEVEMENTS.map(a => ({
            ...a,
            unlocked: this.unlockedAchievements.has(a.id)
        }));
    }

    getCurrentTier(score) {
        let tier = TIER_CONFIG[0];
        for (const t of TIER_CONFIG) {
            if (score >= t.score) tier = t;
        }
        return tier;
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        EventBus.off(GameEvents.SCORE_UPDATE, this.onScoreUpdate, this);
        EventBus.off(GameEvents.SCORE_COMBO, this.onComboUpdate, this);
        EventBus.off(GameEvents.BALL_LAUNCHED, this.onBallLaunched, this);
        EventBus.off(GameEvents.BALL_LOST, this.onBallLost, this);
        EventBus.off(GameEvents.BALL_HIT_BUCKET, this.onBucketHit, this);
        EventBus.off(GameEvents.GOLDEN_BALL_TRIGGERED, this.onGoldenBall, this);
        EventBus.off(GameEvents.MYSTERY_BUCKET_HIT, this.onMysteryHit, this);
        EventBus.off(GameEvents.LUCKY_ZONE_SPAWN, this.onLuckyZoneHit, this);
    }
}

// Export singleton
const AchievementManager = new AchievementManagerClass();
export default AchievementManager;

// Export config
export { ACHIEVEMENTS, DAILY_CHALLENGES, TIER_CONFIG };
