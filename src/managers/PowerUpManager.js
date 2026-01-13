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
        // Removed auto-activation on combo threshold
        // GameScene handles adding spells to inventory now
    }

    /**
     * Reset all power-up states
     */
    reset() {
        // Inventory: Count of possessed spells
        this.inventory = {
            magnet: 0,
            ghost: 0,
            multiBall: 0,
            bigBall: 0,
            goldenBall: 0,
            freeze: 0
        };

        // Equipped: The spell selected for the NEXT ball
        this.equippedSpell = null;

        this.currentBallModifiers = {
            isGolden: false,
            isGhost: false,
            isBig: false,
            hasMagnet: false,
            scoreMultiplier: 1,
            freezePacmans: false
        };
    }

    /**
     * Add a power-up to inventory
     * @param {string} type 
     * @param {number} amount 
     */
    addPowerUp(type, amount = 1) {
        if (this.inventory.hasOwnProperty(type)) {
            this.inventory[type] += amount;
            EventBus.emit(GameEvents.INVENTORY_UPDATE, this.inventory);
            return true;
        }
        return false;
    }

    /**
     * Equip a power-up for the next launch
     * @param {string} type 
     */
    equipPowerUp(type) {
        if (this.inventory[type] > 0) {
            // Toggle off if already equipped
            if (this.equippedSpell === type) {
                this.equippedSpell = null;
            } else {
                this.equippedSpell = type;
            }
            EventBus.emit(GameEvents.POWERUP_EQUIPPED, { type: this.equippedSpell });
            return true;
        }
        return false;
    }

    /**
     * Get modifiers to apply to the next ball launch
     * Consumes the equipped spell from inventory
     * @returns {Object} Ball modifiers
     */
    getNextBallModifiers() {
        const modifiers = {
            isGolden: false,
            isGhost: false,
            isBig: false,
            hasMagnet: false,
            isMultiBall: false,
            scoreMultiplier: 1,
            additionalBalls: 0,
            spreadAngle: 0,
            freezePacmans: false
        };

        // Check for golden ball (random chance independent of spells, OR via spell)
        // If golden spell equipped, force it.
        if (FeatureManager.isEnabled('goldenBall')) {
            const chance = FeatureManager.getParameter('goldenBall', 'chance') || POWERUP_CONFIG.GOLDEN_BALL.CHANCE;
            if (Math.random() < chance) {
                modifiers.isGolden = true;
                modifiers.scoreMultiplier *= POWERUP_CONFIG.GOLDEN_BALL.MULTIPLIER;
                EventBus.emit(GameEvents.GOLDEN_BALL_TRIGGERED);
            }
        }

        // Apply Equipped Spell
        if (this.equippedSpell) {
            const type = this.equippedSpell;
            const config = POWERUP_CONFIG[type.toUpperCase()] || {};

            // Consume inventory
            if (this.inventory[type] > 0) {
                this.inventory[type]--;
                EventBus.emit(GameEvents.INVENTORY_UPDATE, this.inventory);

                // Apply effects
                switch (type) {
                    case 'magnet':
                        modifiers.hasMagnet = true;
                        break;
                    case 'ghost':
                        modifiers.isGhost = true;
                        break;
                    case 'multiBall':
                        modifiers.isMultiBall = true;
                        modifiers.additionalBalls = (config.COUNT || 3) - 1;
                        modifiers.spreadAngle = config.SPREAD_ANGLE || 30;
                        break;
                    case 'bigBall':
                        modifiers.isBig = true;
                        break;
                    case 'goldenBall':
                        modifiers.isGolden = true;
                        modifiers.scoreMultiplier = 2; // Override/Ensure x2
                        break;
                    case 'freeze':
                        modifiers.freezePacmans = true;
                        break;
                }

                EventBus.emit(GameEvents.POWERUP_ACTIVATED, { type });
            }

            // Reset equipped after use
            this.equippedSpell = null;
            EventBus.emit(GameEvents.POWERUP_EQUIPPED, { type: null });
        }

        this.currentBallModifiers = modifiers;
        return modifiers;
    }

    /**
     * Get current inventory
     */
    getInventory() {
        return { ...this.inventory };
    }

    /**
     * Get currently equipped spell
     */
    getEquippedSpell() {
        return this.equippedSpell;
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
