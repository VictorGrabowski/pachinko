/**
 * ScoringSystem - Manages score calculation and bucket creation
 * 
 * Single Responsibility: Handles bucket visual creation and
 * score calculation with multipliers.
 * 
 * @module gameplay/ScoringSystem
 */

import { BUCKET_CONFIG, DESIGN_CONSTANTS } from "../config/gameConfig.js";
import EventBus, { GameEvents } from "../core/EventBus.js";

export default class ScoringSystem {
    /**
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        this.buckets = [];
        this.score = 0;
    }

    /**
     * Create score buckets at bottom of screen
     * @returns {Array} Array of bucket objects
     */
    createBuckets() {
        this.buckets = [];
        const bucketWidth = 800 / BUCKET_CONFIG.length;

        BUCKET_CONFIG.forEach((config, index) => {
            const x = index * bucketWidth + bucketWidth / 2;

            // Bucket visual
            const bucket = this.scene.add.rectangle(
                x,
                950,
                bucketWidth - 10,
                60,
                config.color,
                0.3
            );
            bucket.setStrokeStyle(2, config.color);

            // Label with kanji
            const label = this.scene.add
                .text(x, 950, config.label, {
                    fontSize: "28px",
                    color: "#FFD700",
                    fontFamily: "serif",
                    fontStyle: "bold",
                })
                .setOrigin(0.5);

            // Value text
            const valueText = this.scene.add
                .text(x, 975, config.value.toString(), {
                    fontSize: "16px",
                    color: "#FFFFFF",
                    fontFamily: "serif",
                })
                .setOrigin(0.5);

            // Create physics zone
            const zone = this.scene.add.zone(x, 950, bucketWidth - 10, 60);
            this.scene.physics.add.existing(zone);
            zone.body.setAllowGravity(false);
            zone.body.moves = false;

            this.buckets.push({
                zone,
                config,
                visual: bucket,
                label,
                valueText,
            });
        });

        return this.buckets;
    }

    /**
     * Calculate score with combo multiplier
     * @param {number} baseValue - Base bucket value
     * @param {number} combo - Current combo count
     * @returns {number} Final calculated score
     */
    calculateScore(baseValue, combo = 0) {
        const multiplier = 1 + combo * 0.2;
        return Math.floor(baseValue * multiplier);
    }

    /**
     * Add points to score
     * @param {number} points - Points to add
     * @returns {number} New total score
     */
    addScore(points) {
        this.score += points;
        EventBus.emit(GameEvents.SCORE_UPDATE, { points, total: this.score });
        return this.score;
    }

    /**
     * Get current score
     * @returns {number}
     */
    getScore() {
        return this.score;
    }

    /**
     * Reset score to zero
     */
    resetScore() {
        this.score = 0;
    }

    /**
     * Get buckets array
     * @returns {Array}
     */
    getBuckets() {
        return this.buckets;
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.buckets.forEach((bucket) => {
            bucket.visual.destroy();
            bucket.label.destroy();
            bucket.valueText.destroy();
            bucket.zone.destroy();
        });
        this.buckets = [];
        this.score = 0;
    }
}
