/**
 * EffectsManager - Centralized manager for addictive visual and audio effects
 * 
 * Handles screen shake, slow motion, particle explosions, announcements,
 * near-miss feedback, and flying score animations.
 * 
 * @module managers/EffectsManager
 */

import Phaser from "phaser";
import EventBus, { GameEvents } from "../core/EventBus.js";
import FeatureManager from "./FeatureManager.js";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";

// Combo threshold configuration
const COMBO_THRESHOLDS = {
    GREAT: { combo: 5, text: "GREAT!", color: 0x4CAF50 },
    AMAZING: { combo: 10, text: "AMAZING!", color: 0xFF9800 },
    LEGENDARY: { combo: 20, text: "LEGENDARY!", color: 0xE91E63 },
    GODLIKE: { combo: 50, text: "GODLIKE!", color: 0x9C27B0 }
};

// Effects configuration
const EFFECTS_CONFIG = {
    SCREEN_SHAKE: {
        SMALL: { intensity: 0.003, duration: 100 },
        MEDIUM: { intensity: 0.006, duration: 200 },
        BIG: { intensity: 0.012, duration: 350 }
    },
    SLOW_MOTION: {
        FACTOR: 0.25,
        DURATION: 1200,
        EASE_IN: 200,
        EASE_OUT: 300
    },
    NEAR_MISS_THRESHOLD: 40 // pixels from high-value bucket center
};

class EffectsManagerClass {
    constructor() {
        this.scene = null;
        this.isSlowMotion = false;
        this.originalTimeScale = 1;
        this.announcementQueue = [];
        this.isShowingAnnouncement = false;
    }

    /**
     * Initialize the effects manager with a scene
     * @param {Phaser.Scene} scene - The game scene
     */
    init(scene) {
        this.scene = scene;
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for effect triggers
     */
    setupEventListeners() {
        EventBus.on(GameEvents.SCREEN_SHAKE, this.handleScreenShake, this);
        EventBus.on(GameEvents.COMBO_THRESHOLD, this.handleComboThreshold, this);
        EventBus.on(GameEvents.NEAR_MISS, this.handleNearMiss, this);
        EventBus.on(GameEvents.GOLDEN_BALL_TRIGGERED, this.handleGoldenBall, this);
    }

    /**
     * Handle screen shake event
     * @param {Object} data - { intensity: 'SMALL'|'MEDIUM'|'BIG' }
     */
    handleScreenShake(data) {
        if (!FeatureManager.isEnabled('screenShake')) return;
        const config = EFFECTS_CONFIG.SCREEN_SHAKE[data.intensity || 'MEDIUM'];
        this.screenShake(config.intensity, config.duration);
    }

    /**
     * Handle combo threshold reached
     * @param {Object} data - { combo: number }
     */
    handleComboThreshold(data) {
        if (!FeatureManager.isEnabled('comboAnnouncements')) return;

        const { combo } = data;
        let announcement = null;

        if (combo >= COMBO_THRESHOLDS.GODLIKE.combo) {
            announcement = COMBO_THRESHOLDS.GODLIKE;
        } else if (combo >= COMBO_THRESHOLDS.LEGENDARY.combo) {
            announcement = COMBO_THRESHOLDS.LEGENDARY;
        } else if (combo >= COMBO_THRESHOLDS.AMAZING.combo) {
            announcement = COMBO_THRESHOLDS.AMAZING;
        } else if (combo >= COMBO_THRESHOLDS.GREAT.combo) {
            announcement = COMBO_THRESHOLDS.GREAT;
        }

        if (announcement) {
            this.showAnnouncement(announcement.text, announcement.color);
            EventBus.emit(GameEvents.SCREEN_SHAKE, { intensity: 'MEDIUM' });
        }
    }

    /**
     * Handle near miss event
     * @param {Object} data - { x, y, bucketValue }
     */
    handleNearMiss(data) {
        if (!FeatureManager.isEnabled('nearMissEffect')) return;
        this.showNearMiss(data.x, data.y);
    }

    /**
     * Handle golden ball triggered
     */
    handleGoldenBall() {
        this.showAnnouncement("GOLDEN BALL!", 0xFFD700);
        this.screenShake(0.008, 250);
    }

    // ========== SCREEN SHAKE ==========

    /**
     * Shake the camera
     * @param {number} intensity - Shake intensity (0-0.1)
     * @param {number} duration - Duration in ms
     */
    screenShake(intensity = 0.005, duration = 200) {
        if (!this.scene || !this.scene.cameras || !this.scene.cameras.main) return;

        const intensityMultiplier = FeatureManager.getParameter('screenShake', 'intensity') || 1;
        this.scene.cameras.main.shake(duration, intensity * intensityMultiplier);
    }

    // ========== SLOW MOTION ==========

    /**
     * Start slow motion effect
     * @param {number} factor - Time scale factor (0.1 - 1)
     * @param {number} duration - Total duration in ms
     */
    startSlowMotion(factor = EFFECTS_CONFIG.SLOW_MOTION.FACTOR, duration = EFFECTS_CONFIG.SLOW_MOTION.DURATION) {
        if (!FeatureManager.isEnabled('slowMotion')) return;
        if (this.isSlowMotion || !this.scene) return;

        this.isSlowMotion = true;
        this.originalTimeScale = this.scene.time.timeScale;

        // Ease into slow motion
        this.scene.tweens.add({
            targets: this.scene.time,
            timeScale: factor,
            duration: EFFECTS_CONFIG.SLOW_MOTION.EASE_IN,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // Hold slow motion
                this.scene.time.delayedCall(duration - EFFECTS_CONFIG.SLOW_MOTION.EASE_IN - EFFECTS_CONFIG.SLOW_MOTION.EASE_OUT, () => {
                    this.endSlowMotion();
                });
            }
        });

        EventBus.emit(GameEvents.SLOW_MOTION_START);
    }

    /**
     * End slow motion effect
     */
    endSlowMotion() {
        if (!this.isSlowMotion || !this.scene) return;

        this.scene.tweens.add({
            targets: this.scene.time,
            timeScale: this.originalTimeScale,
            duration: EFFECTS_CONFIG.SLOW_MOTION.EASE_OUT,
            ease: 'Sine.easeIn',
            onComplete: () => {
                this.isSlowMotion = false;
                EventBus.emit(GameEvents.SLOW_MOTION_END);
            }
        });
    }

    // ========== PARTICLE EXPLOSIONS ==========

    /**
     * Create bucket hit explosion
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} color - Particle color
     * @param {number} bucketValue - Bucket value (determines intensity)
     */
    createBucketExplosion(x, y, color, bucketValue = 1) {
        if (!this.scene) return;

        const intensity = Math.min(bucketValue * 3, 30);
        const particles = [];

        for (let i = 0; i < intensity; i++) {
            const angle = (Math.PI * 2 / intensity) * i;
            const speed = 100 + Math.random() * 150;
            const size = 4 + Math.random() * 6;

            const particle = this.scene.add.circle(x, y, size, color);
            particle.setAlpha(0.9);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed - 50,
                alpha: 0,
                scale: 0.2,
                duration: 400 + Math.random() * 200,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });

            particles.push(particle);
        }

        // Big win ring effect for high value buckets
        if (bucketValue >= 5) {
            const ring = this.scene.add.circle(x, y, 10, color, 0);
            ring.setStrokeStyle(3, color, 0.8);

            this.scene.tweens.add({
                targets: ring,
                radius: 80,
                alpha: 0,
                duration: 500,
                ease: 'Quad.easeOut',
                onComplete: () => ring.destroy()
            });
        }

        return particles;
    }

    /**
     * Create combo particles (rainbow effect)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} combo - Current combo count
     */
    createComboParticles(x, y, combo) {
        if (!this.scene || combo < 3) return;

        const colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
        const particleCount = Math.min(combo, 15);

        for (let i = 0; i < particleCount; i++) {
            const color = colors[i % colors.length];
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 50;

            const particle = this.scene.add.circle(x, y, 3 + Math.random() * 3, color);
            particle.setAlpha(0.9);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0.3,
                duration: 300 + Math.random() * 200,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    // ========== ANNOUNCEMENTS ==========

    /**
     * Show announcement text (queued if one is already showing)
     * @param {string} text - Text to display
     * @param {number} color - Text color (hex)
     */
    showAnnouncement(text, color = 0xFFD700) {
        this.announcementQueue.push({ text, color });
        this.processAnnouncementQueue();
    }

    /**
     * Process the announcement queue
     */
    processAnnouncementQueue() {
        if (this.isShowingAnnouncement || this.announcementQueue.length === 0 || !this.scene) return;

        this.isShowingAnnouncement = true;
        const { text, color } = this.announcementQueue.shift();

        const colorHex = '#' + color.toString(16).padStart(6, '0');

        const announcement = this.scene.add.text(400, 300, text, {
            fontSize: '64px',
            fontFamily: 'serif',
            fontStyle: 'bold',
            color: colorHex,
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, fill: true }
        }).setOrigin(0.5).setAlpha(0).setScale(0.5).setDepth(1000);

        // Animate in
        this.scene.tweens.add({
            targets: announcement,
            alpha: 1,
            scale: 1.2,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Hold
                this.scene.time.delayedCall(600, () => {
                    // Animate out
                    this.scene.tweens.add({
                        targets: announcement,
                        alpha: 0,
                        scale: 1.5,
                        y: 250,
                        duration: 300,
                        ease: 'Quad.easeIn',
                        onComplete: () => {
                            announcement.destroy();
                            this.isShowingAnnouncement = false;
                            this.processAnnouncementQueue();
                        }
                    });
                });
            }
        });
    }

    // ========== NEAR MISS ==========

    /**
     * Show near miss effect
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    showNearMiss(x, y) {
        if (!this.scene) return;

        const nearMissText = this.scene.add.text(x, y - 50, "SO CLOSE!", {
            fontSize: '28px',
            fontFamily: 'serif',
            fontStyle: 'bold',
            color: '#FF4444',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0).setDepth(500);

        this.scene.tweens.add({
            targets: nearMissText,
            alpha: 1,
            y: y - 80,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.time.delayedCall(400, () => {
                    this.scene.tweens.add({
                        targets: nearMissText,
                        alpha: 0,
                        y: y - 110,
                        duration: 200,
                        onComplete: () => nearMissText.destroy()
                    });
                });
            }
        });

        // Add red flash at edges
        const flash = this.scene.add.rectangle(400, 500, 800, 1000, 0xFF0000, 0.15);
        flash.setDepth(999);

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 400,
            onComplete: () => flash.destroy()
        });
    }

    // ========== FLYING SCORE ==========

    /**
     * Create flying score animation
     * @param {number} startX - Start X position
     * @param {number} startY - Start Y position
     * @param {number} targetX - Target X position (score display)
     * @param {number} targetY - Target Y position
     * @param {number} score - Score value
     * @param {number} color - Text color
     */
    showFlyingScore(startX, startY, targetX, targetY, score, color = 0xFFD700) {
        if (!this.scene) return;

        const colorHex = '#' + color.toString(16).padStart(6, '0');

        const scoreText = this.scene.add.text(startX, startY, `+${score}`, {
            fontSize: '24px',
            fontFamily: 'serif',
            fontStyle: 'bold',
            color: colorHex,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(500);

        // Calculate control point for curved path
        const controlX = (startX + targetX) / 2;
        const controlY = Math.min(startY, targetY) - 100;

        // Animate along curved path
        this.scene.tweens.add({
            targets: scoreText,
            x: targetX,
            y: targetY,
            scale: 0.5,
            duration: 800,
            ease: 'Quad.easeIn',
            onUpdate: (tween) => {
                // Bezier curve interpolation
                const t = tween.progress;
                const mt = 1 - t;
                scoreText.x = mt * mt * startX + 2 * mt * t * controlX + t * t * targetX;
                scoreText.y = mt * mt * startY + 2 * mt * t * controlY + t * t * targetY;
            },
            onComplete: () => {
                // Flash when reaching score
                this.scene.tweens.add({
                    targets: scoreText,
                    alpha: 0,
                    scale: 1.5,
                    duration: 150,
                    onComplete: () => scoreText.destroy()
                });
            }
        });
    }

    // ========== UTILITY ==========

    /**
     * Check if ball is near a high-value bucket (for near-miss detection)
     * @param {number} ballX - Ball X position
     * @param {number} ballY - Ball Y position
     * @param {Array} buckets - Array of bucket objects
     * @returns {{ isNear: boolean, bucket: Object|null }}
     */
    checkNearMiss(ballX, ballY, buckets) {
        const threshold = EFFECTS_CONFIG.NEAR_MISS_THRESHOLD;

        for (const bucket of buckets) {
            if (bucket.config.value >= 5) { // Only high-value buckets
                const distance = Math.abs(ballX - bucket.zone.x);
                if (distance < threshold && distance > 5) {
                    return { isNear: true, bucket };
                }
            }
        }
        return { isNear: false, bucket: null };
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        EventBus.off(GameEvents.SCREEN_SHAKE, this.handleScreenShake, this);
        EventBus.off(GameEvents.COMBO_THRESHOLD, this.handleComboThreshold, this);
        EventBus.off(GameEvents.NEAR_MISS, this.handleNearMiss, this);
        EventBus.off(GameEvents.GOLDEN_BALL_TRIGGERED, this.handleGoldenBall, this);
        this.scene = null;
        this.announcementQueue = [];
    }
}

// Export singleton
const EffectsManager = new EffectsManagerClass();
export default EffectsManager;

// Also export config for external use
export { COMBO_THRESHOLDS, EFFECTS_CONFIG };
