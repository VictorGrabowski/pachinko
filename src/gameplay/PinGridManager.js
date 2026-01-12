/**
 * PinGridManager - Manages pin grid creation and movement
 * 
 * Single Responsibility: Creates and controls the pin grid layout,
 * including the moving pins feature.
 * 
 * @module gameplay/PinGridManager
 */

import Pin from "../entities/Pin.js";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";
import { applyWabiSabi } from "../utils/helpers.js";
import FeatureManager from "../managers/FeatureManager.js";

export default class PinGridManager {
    /**
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        this.pins = null;
        this.pinGridBounds = null;
        this.movingPinsData = null;
    }

    /**
     * Create staggered pin grid with wabi-sabi imperfection
     * @returns {Phaser.Physics.Arcade.StaticGroup} The pins physics group
     */
    createGrid() {
        // Use a static physics group to prevent pin movement from collisions
        this.pins = this.scene.physics.add.staticGroup();

        // Get pin configuration from FeatureManager
        const rows = FeatureManager.getParameter("pins", "rows") || 12;
        const cols = FeatureManager.getParameter("pins", "cols") || 8;
        const useWabiSabi = FeatureManager.getParameter("pins", "wabiSabi") !== false;
        const useRandomSize = FeatureManager.getParameter("pins", "randomSize") === true;
        const spacing = DESIGN_CONSTANTS.PIN_SPACING;
        const startY = 200;

        // Calculate horizontal centering based on number of columns
        const gridWidth = (cols - 1) * spacing;
        const startX = (800 - gridWidth) / 2;

        // Store pin grid boundaries for start zone calculation
        this.pinGridBounds = {
            startX: startX,
            endX: startX + gridWidth,
            width: gridWidth
        };

        for (let row = 0; row < rows; row++) {
            const offsetX = (row % 2) * (spacing / 2);
            const pinsInRow = cols - (row % 2);

            for (let col = 0; col < pinsInRow; col++) {
                const baseX = startX + col * spacing + offsetX;
                const baseY = startY + row * spacing;
                
                const x = useWabiSabi ? applyWabiSabi(baseX) : baseX;
                const y = useWabiSabi ? applyWabiSabi(baseY) : baseY;

                // Apply random size if enabled (variation between 0.3 and 2.0)
                const size = useRandomSize ? 0.3 + Math.random() * 1.7 : 1.0;

                const pin = new Pin(this.scene, x, y);
                this.pins.add(pin);

                // Apply scale if random size is enabled
                if (useRandomSize) {
                    pin.setScale(size);
                }

                // Configure circular physics body with offset to center
                // Pin texture is 16x16 with circle at center (8,8)
                // Radius 6 = diameter 12, so offset = (16-12)/2 = 2
                if (pin.body) {
                    const radius = useRandomSize ? 6 * size : 6;
                    const offset = useRandomSize ? 2 * size : 2;
                    pin.body.setCircle(radius, offset, offset);
                }

                // Store row index and initial position for moving pins mode
                pin.rowIndex = row;
                pin.initialX = x;
            }
        }

        return this.pins;
    }

    /**
     * Initialize moving pins mode with oscillating animation
     */
    initMovingPins() {
        if (!FeatureManager.isEnabled('movingPins')) {
            return;
        }

        const speed = FeatureManager.getParameter('movingPins', 'speed') || 50;
        const distance = FeatureManager.getParameter('movingPins', 'distance') || 30;
        const alternateDirection = FeatureManager.getParameter('movingPins', 'alternateDirection') !== false;

        this.movingPinsData = {
            speed,
            distance,
            alternateDirection
        };

        // Create tweens for even-row pins (0, 2, 4, etc.)
        this.pins.children.entries.forEach((pin) => {
            if (pin.rowIndex % 2 === 0) {
                // Initial direction: right for even rows
                const direction = alternateDirection && (pin.rowIndex / 2) % 2 === 1 ? -1 : 1;

                this.scene.tweens.add({
                    targets: pin,
                    x: pin.initialX + (distance * direction),
                    duration: (distance / speed) * 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.inOut',
                    onUpdate: () => {
                        // Update physics body position
                        if (pin.body) {
                            pin.body.reset(pin.x, pin.y);
                        }
                    }
                });
            }
        });
    }

    /**
     * Update moving pins physics bodies (call in update loop)
     */
    updateMovingPins() {
        if (!FeatureManager.isEnabled('movingPins')) {
            return;
        }

        this.pins.children.entries.forEach((pin) => {
            if (pin.rowIndex % 2 === 0 && pin.body) {
                pin.body.reset(pin.x, pin.y);
            }
        });
    }

    /**
     * Get pin grid boundaries for start zone calculation
     * @returns {{startX: number, endX: number, width: number}|null}
     */
    getBounds() {
        return this.pinGridBounds;
    }

    /**
     * Get the pins physics group
     * @returns {Phaser.Physics.Arcade.StaticGroup}
     */
    getPins() {
        return this.pins;
    }

    /**
     * Destroy all pins and clean up
     */
    destroy() {
        if (this.pins) {
            this.pins.clear(true, true);
            this.pins = null;
        }
        this.pinGridBounds = null;
        this.movingPinsData = null;
    }
}
