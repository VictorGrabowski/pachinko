/**
 * CreatureManager - Manages yokai creature spawning and behavior
 * 
 * Single Responsibility: Handles creature creation, movement updates,
 * and creature-specific effects.
 * 
 * @module gameplay/CreatureManager
 */

import Creature from "../entities/Creature.js";
import { CREATURE_CONFIG } from "../config/gameConfig.js";
import FeatureManager from "../managers/FeatureManager.js";

export default class CreatureManager {
    /**
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        this.creatures = [];
        this.creature = null; // Backward compatibility reference
    }

    /**
     * Create creatures if feature is enabled
     * @returns {Array<Creature>} Array of created creatures
     */
    createCreatures() {
        if (!FeatureManager.isEnabled("creature")) {
            this.creature = null;
            return [];
        }

        // Get creature configuration from FeatureManager
        const speed = FeatureManager.getParameter("creature", "speed") || CREATURE_CONFIG.SPEED;
        const count = FeatureManager.getParameter("creature", "count") || 1;
        const dashIntensity = FeatureManager.getParameter("creature", "dashIntensity") || 2.0;
        const creatureSize = FeatureManager.getParameter("creature", "creatureSize") || CREATURE_CONFIG.RADIUS;

        // Creature color palette - vibrant colors for each creature
        const creatureColors = [0xFFE135, 0x00FFFF, 0xFF00FF, 0x00FF00, 0xFF6B00];

        // Create config with updated parameters
        const config = {
            ...CREATURE_CONFIG,
            SPEED: speed,
            RADIUS: creatureSize,
            DASH_INTENSITY: dashIntensity,
        };

        // Create multiple creatures
        this.creatures = [];
        for (let i = 0; i < count; i++) {
            const centerX = (CREATURE_CONFIG.MIN_X + CREATURE_CONFIG.MAX_X) / 2;
            const centerY = (CREATURE_CONFIG.MIN_Y + CREATURE_CONFIG.MAX_Y) / 2;
            const offsetX = (i - (count - 1) / 2) * 100; // Spread horizontally

            const creatureConfig = {
                ...config,
                COLOR: creatureColors[i % creatureColors.length],
            };

            const creature = new Creature(this.scene, centerX + offsetX, centerY, creatureConfig);
            this.creatures.push(creature);
        }

        // Backward compatibility
        this.creature = this.creatures[0];

        return this.creatures;
    }

    /**
     * Update all creatures (call in update loop)
     * @param {number} time - Game time
     * @param {number} delta - Delta time
     */
    update(time, delta) {
        if (this.creatures && this.creatures.length > 0) {
            this.creatures.forEach((creature) => {
                creature.update(time, delta);
            });
        }
    }

    /**
     * Play eat animation on first creature
     */
    playEatAnimation() {
        if (this.creature) {
            this.scene.tweens.add({
                targets: this.creature,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 150,
                yoyo: true,
                ease: "Back.easeOut",
            });
        }
    }

    /**
     * Get creatures array
     * @returns {Array<Creature>}
     */
    getCreatures() {
        return this.creatures;
    }

    /**
     * Check if creatures feature is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return FeatureManager.isEnabled("creature");
    }

    /**
     * Clean up all creatures
     */
    destroy() {
        if (this.creatures) {
            this.creatures.forEach((creature) => {
                if (creature && creature.active) {
                    this.scene.tweens.killTweensOf(creature);
                    creature.destroy();
                }
            });
            this.creatures = [];
            this.creature = null;
        }
    }
}
