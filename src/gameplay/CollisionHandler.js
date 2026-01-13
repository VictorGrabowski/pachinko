/**
 * CollisionHandler - Manages all collision logic
 * 
 * Single Responsibility: Handles collision detection setup and
 * collision event responses for balls with pins, buckets, and creatures.
 * 
 * @module gameplay/CollisionHandler
 */

import { DESIGN_CONSTANTS } from "../config/gameConfig.js";
import FeatureManager from "../managers/FeatureManager.js";
import EventBus, { GameEvents } from "../core/EventBus.js";

export default class CollisionHandler {
    /**
     * @param {Phaser.Scene} scene - The game scene
     * @param {Object} callbacks - Callback functions for scoring and game flow
     * @param {Function} callbacks.onScore - Called when ball hits bucket
     * @param {Function} callbacks.onBallLost - Called when ball is eaten/lost
     * @param {Function} callbacks.onGameOver - Called when lives reach 0
     */
    constructor(scene, callbacks = {}) {
        this.scene = scene;
        this.callbacks = callbacks;
        this.audioSystem = null;
    }

    /**
     * Set audio system for collision sounds
     * @param {AudioSystem} audioSystem 
     */
    setAudioSystem(audioSystem) {
        this.audioSystem = audioSystem;
    }

    /**
     * Setup collision between ball and pins
     * @param {Ball} ball - The ball to add collision for
     * @param {Phaser.Physics.Arcade.StaticGroup} pins - The pins group
     */
    setupPinCollision(ball, pins) {
        this.scene.physics.add.collider(ball, pins, (ballObj, pin) => {
            this.handlePinHit(ballObj, pin);
        });
    }

    /**
     * Setup overlap with buckets
     * @param {Ball} ball - The ball to check
     * @param {Array} buckets - Array of bucket objects
     */
    setupBucketOverlap(ball, buckets) {
        buckets.forEach((bucket) => {
            this.scene.physics.add.overlap(ball, bucket.zone, () => {
                this.handleBucketHit(ball, bucket);
            });
        });
    }

    /**
     * Setup overlap with creatures
     * @param {Ball} ball - The ball to check
     * @param {Array} creatures - Array of creature objects
     */
    setupCreatureOverlap(ball, creatures) {
        if (!FeatureManager.isEnabled("creature") || !creatures) {
            return;
        }

        creatures.forEach((creature) => {
            this.scene.physics.add.overlap(ball, creature, () => {
                this.handleCreatureEatBall(ball);
            });
        });
    }

    /**
     * Handle pin collision
     * @param {Ball} ball - The ball that hit
     * @param {Pin} pin - The pin that was hit
     */
    handlePinHit(ball, pin) {
        if (!ball.active) return;

        // Only count hit if it's a different pin than the last one
        const wasNewPin = ball.hitPin(pin);

        // Visual feedback on pin (always show)
        pin.onHit();

        // Audio and combo effects only if it's a new pin
        if (wasNewPin) {
            if (this.audioSystem) {
                this.audioSystem.play("coin");
            }

            // Screen shake effect
            this.scene.cameras.main.shake(50, 0.002);

            // Emit event for UI updates
            EventBus.emit(GameEvents.BALL_HIT_PIN, { ball, pin, combo: ball.getCombo() });

            // Combo effects
            const combo = ball.getCombo();
            if (combo > 0) {
                this.createComboParticles(ball);
            }
        }
    }

    /**
     * Create rainbow particles for combos
     * @param {Ball} ball - The ball with combo
     */
    createComboParticles(ball) {
        const rainbow = this.scene.add.particles(ball.x, ball.y, "particle", {
            speed: { min: 50, max: 150 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 5,
            tint: [0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0000ff, 0xff00ff],
            blendMode: 'ADD',
        });
        this.scene.time.delayedCall(500, () => rainbow.destroy());
    }

    /**
     * Handle bucket scoring
     * @param {Ball} ball - The ball that scored
     * @param {Object} bucket - The bucket object with config
     */
    handleBucketHit(ball, bucket) {
        if (!ball.active) return;

        ball.setActive(false);

        const combo = ball.getCombo();
        const multiplier = Math.max(1, combo); // Le combo multiplie directement le score
        const points = Math.floor((bucket.config.value * multiplier) / 10); // Divisé par 10

        // Visual feedback
        this.createBucketHitEffects(ball, bucket);

        // Screen shake
        this.scene.cameras.main.shake(200, 0.005);

        // Emit events
        EventBus.emit(GameEvents.BALL_HIT_BUCKET, { ball, bucket, points, combo });
        EventBus.emit(GameEvents.SCORE_UPDATE, { points, total: points });

        // Show floating score text
        this.showFloatingText(ball.x, ball.y, `+${points}`);

        // Show combo text if significant
        if (combo >= DESIGN_CONSTANTS.COMBO_THRESHOLD) {
            this.showComboText(combo, ball.x);
        }

        // Notify callback
        if (this.callbacks.onScore) {
            this.callbacks.onScore(points, ball);
        }
    }

    /**
     * Create bucket hit visual effects
     * @param {Ball} ball - The ball
     * @param {Object} bucket - The bucket
     */
    createBucketHitEffects(ball, bucket) {
        // Label animation
        this.scene.tweens.add({
            targets: [bucket.label, bucket.valueText],
            scale: 2,
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut',
        });

        // Bucket flash
        this.scene.tweens.add({
            targets: bucket.visual,
            alpha: 0.3,
            duration: 200,
            yoyo: true,
        });

        // Particle explosion
        const explosion = this.scene.add.particles(ball.x, ball.y, "particle", {
            speed: { min: 200, max: 400 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 800,
            quantity: 30,
            tint: [bucket.config.color, DESIGN_CONSTANTS.COLORS.GOLD, 0xffffff],
            blendMode: 'ADD',
            angle: { min: -120, max: -60 },
        });
        this.scene.time.delayedCall(800, () => explosion.destroy());

        // White flash
        const flash = this.scene.add.rectangle(ball.x, ball.y, 100, 100, 0xffffff, 0.8);
        flash.setBlendMode('ADD');
        this.scene.tweens.add({
            targets: flash,
            scale: 3,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy(),
        });

        // Shockwave rings
        for (let i = 0; i < 3; i++) {
            const wave = this.scene.add.circle(ball.x, ball.y, 20, bucket.config.color, 0.5);
            wave.setBlendMode('ADD');
            this.scene.time.delayedCall(i * 100, () => {
                this.scene.tweens.add({
                    targets: wave,
                    scale: 8,
                    alpha: 0,
                    duration: 600,
                    ease: 'Cubic.easeOut',
                    onComplete: () => wave.destroy(),
                });
            });
        }
    }

    /**
     * Handle creature eating ball
     * @param {Ball} ball - The ball that was eaten
     */
    handleCreatureEatBall(ball) {
        if (!ball.active) return;

        ball.setActive(false);

        // Disintegration effect
        const particles = this.scene.add.particles(ball.x, ball.y, "petal", {
            speed: { min: 100, max: 200 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 15,
            tint: DESIGN_CONSTANTS.COLORS.PRIMARY,
        });

        // Ball disintegration animation
        this.scene.tweens.add({
            targets: ball,
            scale: 0,
            alpha: 0,
            duration: 200,
            ease: "Power2",
        });

        // Stop ball trail
        if (ball.trail) {
            ball.trail.stop();
        }

        // Emit event
        EventBus.emit(GameEvents.BALL_LOST, { ball, cause: 'creature' });

        // Cleanup particles after animation
        this.scene.time.delayedCall(700, () => {
            particles.destroy();
        });

        // Notify callback
        if (this.callbacks.onBallLost) {
            this.callbacks.onBallLost(ball, 'creature');
        }
    }

    /**
     * Show floating score text
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Text to display
     * @param {string} color - Text color
     */
    showFloatingText(x, y, text, color = "#FFD700") {
        const floatingText = this.scene.add
            .text(x, y, text, {
                fontSize: "32px",
                color,
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 4,
            })
            .setOrigin(0.5);

        this.scene.tweens.add({
            targets: floatingText,
            y: y - 100,
            alpha: 0,
            duration: 1000,
            ease: "Cubic.easeOut",
            onComplete: () => floatingText.destroy(),
        });
    }

    /**
     * Show combo achievement text
     * @param {number} combo - Combo count
     * @param {number} x - X position
     */
    showComboText(combo, x) {
        const comboText = this.scene.add
            .text(x, 400, `${combo} COMBO!`, {
                fontSize: "48px",
                color: "#FF6B35",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 6,
            })
            .setOrigin(0.5);

        // Ma (間) moment - brief pause effect
        this.scene.tweens.add({
            targets: comboText,
            scale: 1.5,
            alpha: 0,
            duration: 1500,
            ease: "Back.easeOut",
            onComplete: () => comboText.destroy(),
        });
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.audioSystem = null;
        this.callbacks = {};
    }
}
