/**
 * PowerUpManager - Manages power-up states and effects
 * 
 * Power-ups include:
 * - Magnet Ball: Attracts towards high-value buckets
 * - Ghost Ball: Passes through first N rows of pins
 * - Multi-Ball: Launches multiple balls at once
 * - Big Ball: Larger ball with different physics
 * - Golden Ball: 1/10 chance for double points (auto-triggered)
 * 
 * @module managers/PowerUpManager
 */

import EventBus, { GameEvents } from "../core/EventBus.js";
import FeatureManager from "./FeatureManager.js";

// Power-up configuration
const POWERUP_CONFIG = {
    MAGNET: {
        STRENGTH: 0.3,
        DURATION_LAUNCHES: 3,
        COST: 100
    },
    GHOST: {
        DURATION_LAUNCHES: 1,
        PASSTHROUGH_ROWS: 3,
        COST: 75
    },
    MULTI_BALL: {
        COUNT: 3,
        SPREAD_ANGLE: 30,
        COST: 150
    },
    BIG_BALL: {
        SIZE_MULTIPLIER: 1.5,
        DURATION_LAUNCHES: 1,
        COST: 50
    },
    GOLDEN_BALL: {
        CHANCE: 0.1,
        MULTIPLIER: 2
    }
};

class PowerUpManagerClass {
    constructor() {
        this.reset();
    }

    /**
     * Initialize the manager
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        EventBus.on(GameEvents.COMBO_THRESHOLD, this.handleComboThreshold, this);
    }

    /**
     * Handle combo threshold awards
     * @param {Object} data - { combo }
     */
    handleComboThreshold(data) {
        const { combo } = data;

        // Award power-ups based on combo milestones
        if (combo === 5) {
            this.activatePowerUp('magnet');
            EventBus.emit(GameEvents.UI_MESSAGE, { text: "MAGNET BALL UNLOCKED!", color: 0x00FFFF });
        } else if (combo === 10) {
            this.activatePowerUp('multiBall');
            EventBus.emit(GameEvents.UI_MESSAGE, { text: "MULTI-BALL READY!", color: 0xFF00FF });
        } else if (combo === 20) {
            this.activatePowerUp('ghost');
            EventBus.emit(GameEvents.UI_MESSAGE, { text: "GHOST BALL AQUIRED!", color: 0xFFFFFF });
        } else if (combo === 30) {
            this.activatePowerUp('bigBall');
            EventBus.emit(GameEvents.UI_MESSAGE, { text: "BIG BALL INCOMING!", color: 0xFFA500 });
        }
    }

    /**
     * Reset all power-up states
     */
    reset() {
        this.powerUps = {
            magnet: { active: false, remainingLaunches: 0 },
            ghost: { active: false, remainingLaunches: 0 },
            multiBall: { active: false, count: 0 },
            bigBall: { active: false, remainingLaunches: 0 },
            goldenBall: { active: false }
        };
        this.currentBallModifiers = {
            isGolden: false,
            isGhost: false,
            isBig: false,
            hasMagnet: false,
            scoreMultiplier: 1
        };
    }

    /**
     * Activate a power-up
     * @param {string} type - Power-up type ('magnet', 'ghost', 'multiBall', 'bigBall')
     * @returns {boolean} Success
     */
    activatePowerUp(type) {
        const config = POWERUP_CONFIG[type.toUpperCase()];
        if (!config) return false;

        switch (type) {
            case 'magnet':
                this.powerUps.magnet.active = true;
                this.powerUps.magnet.remainingLaunches = config.DURATION_LAUNCHES;
                break;
            case 'ghost':
                this.powerUps.ghost.active = true;
                this.powerUps.ghost.remainingLaunches = config.DURATION_LAUNCHES;
                break;
            case 'multiBall':
                this.powerUps.multiBall.active = true;
                this.powerUps.multiBall.count = config.COUNT;
                break;
            case 'bigBall':
                this.powerUps.bigBall.active = true;
                this.powerUps.bigBall.remainingLaunches = config.DURATION_LAUNCHES;
                break;
        }

        EventBus.emit(GameEvents.POWERUP_ACTIVATED, { type, config });
        return true;
    }

    /**
     * Check if a power-up is active
     * @param {string} type - Power-up type
     * @returns {boolean}
     */
    isActive(type) {
        return this.powerUps[type]?.active || false;
    }

    /**
     * Get modifiers to apply to the next ball launch
     * Decrements remaining launches for applicable power-ups
     * @returns {Object} Ball modifiers
     */
    getNextBallModifiers() {
        const modifiers = {
            isGolden: false,
            isGhost: false,
            isBig: false,
            hasMagnet: false,
            scoreMultiplier: 1,
            additionalBalls: 0,
            spreadAngle: 0
        };

        // Check for golden ball (random chance)
        if (FeatureManager.isEnabled('goldenBall')) {
            const chance = FeatureManager.getParameter('goldenBall', 'chance') || POWERUP_CONFIG.GOLDEN_BALL.CHANCE;
            if (Math.random() < chance) {
                modifiers.isGolden = true;
                modifiers.scoreMultiplier *= POWERUP_CONFIG.GOLDEN_BALL.MULTIPLIER;
                EventBus.emit(GameEvents.GOLDEN_BALL_TRIGGERED);
            }
        }

        // Apply magnet
        if (this.powerUps.magnet.active) {
            modifiers.hasMagnet = true;
            this.powerUps.magnet.remainingLaunches--;
            if (this.powerUps.magnet.remainingLaunches <= 0) {
                this.deactivatePowerUp('magnet');
            }
        }

        // Apply ghost
        if (this.powerUps.ghost.active) {
            modifiers.isGhost = true;
            this.powerUps.ghost.remainingLaunches--;
            if (this.powerUps.ghost.remainingLaunches <= 0) {
                this.deactivatePowerUp('ghost');
            }
        }

        // Apply big ball
        if (this.powerUps.bigBall.active) {
            modifiers.isBig = true;
            this.powerUps.bigBall.remainingLaunches--;
            if (this.powerUps.bigBall.remainingLaunches <= 0) {
                this.deactivatePowerUp('bigBall');
            }
        }

        // Apply multi-ball
        if (this.powerUps.multiBall.active) {
            modifiers.additionalBalls = this.powerUps.multiBall.count - 1;
            modifiers.spreadAngle = POWERUP_CONFIG.MULTI_BALL.SPREAD_ANGLE;
            this.deactivatePowerUp('multiBall');
        }

        this.currentBallModifiers = modifiers;
        return modifiers;
    }

    /**
     * Deactivate a power-up
     * @param {string} type - Power-up type
     */
    deactivatePowerUp(type) {
        if (this.powerUps[type]) {
            this.powerUps[type].active = false;
            this.powerUps[type].remainingLaunches = 0;
            if (type === 'multiBall') {
                this.powerUps[type].count = 0;
            }
            EventBus.emit(GameEvents.POWERUP_EXPIRED, { type });
        }
    }

    /**
     * Get current ball modifiers (for active ball)
     * @returns {Object}
     */
    getCurrentModifiers() {
        return this.currentBallModifiers;
    }

    /**
     * Get power-up cost
     * @param {string} type - Power-up type
     * @returns {number}
     */
    getCost(type) {
        return POWERUP_CONFIG[type.toUpperCase()]?.COST || 0;
    }

    /**
     * Get all power-up states
     * @returns {Object}
     */
    getAllStates() {
        return { ...this.powerUps };
    }

    /**
     * Get ghost passthrough rows configuration
     * @returns {number}
     */
    getGhostPassthroughRows() {
        return POWERUP_CONFIG.GHOST.PASSTHROUGH_ROWS;
    }

    /**
     * Get magnet strength configuration
     * @returns {number}
     */
    getMagnetStrength() {
        return POWERUP_CONFIG.MAGNET.STRENGTH;
    }

    /**
     * Get big ball size multiplier
     * @returns {number}
     */
    getBigBallMultiplier() {
        return POWERUP_CONFIG.BIG_BALL.SIZE_MULTIPLIER;
    }
}

// Export singleton
const PowerUpManager = new PowerUpManagerClass();
export default PowerUpManager;

// Also export config
export { POWERUP_CONFIG };
