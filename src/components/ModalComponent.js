import { DESIGN_CONSTANTS } from '../config/gameConfig.js';

/**
 * ModalComponent - Reusable modal for configuring feature parameters
 * 
 * This class creates a modal overlay with parameter controls (sliders, toggles, etc.)
 * The modal dynamically generates UI based on the parameter definitions.
 * 
 * Usage:
 *   const modal = new ModalComponent(scene);
 *   modal.show(featureDefinition, currentValues, (updatedValues) => {
 *     // Handle save
 *   });
 */
export default class ModalComponent {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.isVisible = false;
    this.onSaveCallback = null;
    this.parameterControls = [];
  }

  /**
   * Helper function to draw a rounded rectangle
   */
  drawRoundedRect(graphics, x, y, width, height, radius, fillColor, fillAlpha = 1, strokeColor = null, strokeWidth = 0, strokeAlpha = 1) {
    graphics.fillStyle(fillColor, fillAlpha);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    if (strokeColor !== null && strokeWidth > 0) {
      graphics.lineStyle(strokeWidth, strokeColor, strokeAlpha);
      graphics.strokeRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    }
  }

  /**
   * Show the modal with feature configuration
   * @param {Object} feature - Feature definition with parameters
   * @param {Object} currentValues - Current parameter values
   * @param {Function} onSave - Callback when save is clicked
   */
  show(feature, currentValues, onSave) {
    if (this.isVisible) {
      this.hide();
    }

    this.currentFeature = feature; // Store feature for reset functionality
    this.onSaveCallback = onSave;
    this.parameterControls = [];
    
    // Create container
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000);

    // Background dimmer
    const dimmer = this.scene.add.rectangle(
      400, 500, 800, 1000, 0x000000, 0.75
    );
    dimmer.setInteractive();
    this.container.add(dimmer);

    // Calculate modal height based on parameters
    const modalWidth = 520;
    const numParams = feature.parameters ? feature.parameters.length : 0;
    // Base: title(60) + desc(50) + buttons(80) = 190, each param adds 65
    const baseHeight = 190;
    const paramHeight = numParams * 65;
    const modalHeight = Math.min(700, Math.max(320, baseHeight + paramHeight));
    const modalCenterY = 500;
    const modalTop = modalCenterY - modalHeight / 2;
    const modalBottom = modalCenterY + modalHeight / 2;
    const modalRadius = 20;
    
    // Modal background with rounded corners
    const modalBgGraphics = this.scene.add.graphics();
    this.drawRoundedRect(modalBgGraphics, 400, modalCenterY, modalWidth, modalHeight, modalRadius, DESIGN_CONSTANTS.COLORS.BACKGROUND, 0.98, DESIGN_CONSTANTS.COLORS.GOLD, 2, 0.5);
    this.container.add(modalBgGraphics);

    // Title - cleaner
    const title = this.scene.add.text(400, modalTop + 35, feature.name, {
      fontSize: "24px",
      fontFamily: "serif",
      color: "#ffffff",
      fontStyle: "bold",
      align: "center"
    }).setOrigin(0.5);
    this.container.add(title);

    // Description - subtle
    const desc = this.scene.add.text(400, modalTop + 65, feature.description, {
      fontSize: "13px",
      fontFamily: "serif",
      color: "#aaaaaa",
      align: "center",
      wordWrap: { width: modalWidth - 60 }
    }).setOrigin(0.5);
    this.container.add(desc);

    // Generate parameter controls
    let yPos = modalTop + 100;
    if (feature.parameters && feature.parameters.length > 0) {
      feature.parameters.forEach(param => {
        const control = this.createParameterControl(
          param,
          currentValues[param.key],
          yPos,
          modalWidth
        );
        this.parameterControls.push(control);
        yPos += 65;
      });
    } else {
      // No parameters message
      const noParams = this.scene.add.text(400, modalTop + 140, "Pas de paramètres configurables", {
        fontSize: "14px",
        fontFamily: "serif",
        color: "#666666",
        align: "center"
      }).setOrigin(0.5);
      this.container.add(noParams);
    }

    // Buttons
    this.createButtons(modalWidth, modalBottom);

    this.isVisible = true;

    // Fade in animation
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
  }

  /**
   * Create control for a parameter
   * @param {Object} param - Parameter definition
   * @param {any} currentValue - Current value
   * @param {number} y - Y position
   * @param {number} modalWidth - Modal width
   * @returns {Object} Control object with getValue method
   */
  createParameterControl(param, currentValue, y, modalWidth) {
    // Clamp currentValue to min/max range
    if (param.type === 'number') {
      currentValue = Phaser.Math.Clamp(currentValue, param.min, param.max);
    }
    
    const control = {
      param: param,
      getValue: () => currentValue
    };

    // Label
    const label = this.scene.add.text(140, y, param.label, {
      fontSize: "15px",
      fontFamily: "serif",
      color: "#cccccc"
    });
    this.container.add(label);

    if (param.type === 'number') {
      // Slider control
      const sliderWidth = 260;
      const sliderX = 360;

      // Slider background - rounded track
      const sliderBgGraphics = this.scene.add.graphics();
      sliderBgGraphics.fillStyle(0x3a3a3a, 1);
      sliderBgGraphics.fillRoundedRect(sliderX - sliderWidth/2, y - 3, sliderWidth, 6, 3);
      this.container.add(sliderBgGraphics);

      // Slider track - rounded
      const trackWidth = ((currentValue - param.min) / (param.max - param.min)) * sliderWidth;
      const sliderTrackGraphics = this.scene.add.graphics();
      sliderTrackGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 1);
      sliderTrackGraphics.fillRoundedRect(sliderX - sliderWidth/2, y - 3, trackWidth, 6, 3);
      this.container.add(sliderTrackGraphics);

      // Slider handle
      const handleX = sliderX - sliderWidth/2 + trackWidth;
      const sliderHandle = this.scene.add.circle(
        handleX, y, 10,
        DESIGN_CONSTANTS.COLORS.ACCENT
      );
      sliderHandle.setInteractive({ draggable: true });
      this.container.add(sliderHandle);

      // Value display
      const valueText = this.scene.add.text(sliderX + sliderWidth/2 + 25, y, currentValue.toFixed(param.step < 1 ? 1 : 0), {
        fontSize: "16px",
        fontFamily: "serif",
        color: "#ffffff",
        fontStyle: "bold"
      }).setOrigin(0, 0.5);
      this.container.add(valueText);

      // Drag handler
      sliderHandle.on('drag', (pointer, dragX, dragY) => {
        const sliderWidth = 260;
        const sliderX = 360;
        const minX = sliderX - sliderWidth/2;
        const maxX = sliderX + sliderWidth/2;
        const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
        
        sliderHandle.x = clampedX;
        
        // Update track
        const newTrackWidth = clampedX - minX;
        sliderTrackGraphics.clear();
        sliderTrackGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 1);
        sliderTrackGraphics.fillRoundedRect(minX, y - 3, newTrackWidth, 6, 3);
        
        // Calculate value
        const ratio = (clampedX - minX) / sliderWidth;
        const value = param.min + ratio * (param.max - param.min);
        const steppedValue = Math.round(value / param.step) * param.step;
        
        currentValue = steppedValue;
        valueText.setText(steppedValue.toFixed(param.step < 1 ? 1 : 0));
      });

      control.getValue = () => currentValue;
      // Store references for reset functionality
      control.trackGraphics = sliderTrackGraphics;
      control.handle = sliderHandle;
      control.valueText = valueText;
      control.sliderX = sliderX;
      control.sliderWidth = 260;

    } else if (param.type === 'boolean') {
      // Toggle control - pill shaped
      const toggleX = 400;
      const toggleWidth = 50;
      const toggleHeight = 26;

      // Toggle background - pill
      const toggleBgGraphics = this.scene.add.graphics();
      toggleBgGraphics.fillStyle(currentValue ? DESIGN_CONSTANTS.COLORS.GOLD : 0x444444, 1);
      toggleBgGraphics.fillRoundedRect(toggleX - toggleWidth/2, y - toggleHeight/2, toggleWidth, toggleHeight, toggleHeight/2);
      this.container.add(toggleBgGraphics);

      // Toggle handle
      const handleRadius = 10;
      const handleX = currentValue ? toggleX + toggleWidth/2 - handleRadius - 3 : toggleX - toggleWidth/2 + handleRadius + 3;
      const toggleHandle = this.scene.add.circle(
        handleX, y, handleRadius, 0xffffff
      );
      this.container.add(toggleHandle);
      
      // Hit area
      const toggleHitArea = this.scene.add.rectangle(toggleX, y, toggleWidth + 10, toggleHeight + 10, 0x000000, 0);
      toggleHitArea.setInteractive({ useHandCursor: true });
      this.container.add(toggleHitArea);

      // State text
      const stateText = this.scene.add.text(toggleX + 45, y, currentValue ? "ON" : "OFF", {
        fontSize: "14px",
        fontFamily: "serif",
        color: currentValue ? "#ffffff" : "#666666",
        fontStyle: "bold"
      }).setOrigin(0, 0.5);
      this.container.add(stateText);

      // Click handler
      toggleHitArea.on('pointerdown', () => {
        currentValue = !currentValue;
        
        // Update visual
        toggleBgGraphics.clear();
        toggleBgGraphics.fillStyle(currentValue ? DESIGN_CONSTANTS.COLORS.GOLD : 0x444444, 1);
        toggleBgGraphics.fillRoundedRect(toggleX - toggleWidth/2, y - toggleHeight/2, toggleWidth, toggleHeight, toggleHeight/2);
        
        const newHandleX = currentValue ? toggleX + toggleWidth/2 - handleRadius - 3 : toggleX - toggleWidth/2 + handleRadius + 3;
        this.scene.tweens.add({
          targets: toggleHandle,
          x: newHandleX,
          duration: 150,
          ease: 'Sine.easeInOut'
        });

        stateText.setText(currentValue ? "ON" : "OFF");
        stateText.setColor(currentValue ? "#ffffff" : "#666666");
      });

      control.getValue = () => currentValue;
      // Store references for reset functionality
      control.toggleBgGraphics = toggleBgGraphics;
      control.toggleHandle = toggleHandle;
      control.toggleX = toggleX;
      control.toggleWidth = toggleWidth;
      control.toggleHeight = toggleHeight;
      control.handleRadius = handleRadius;
      control.stateText = stateText;

      control.getValue = () => currentValue;
    }

    return control;
  }

  /**
   * Create save/cancel buttons
   * @param {number} modalWidth - Modal width
   * @param {number} modalBottom - Modal bottom Y position
   */
  createButtons(modalWidth, modalBottom) {
    const buttonY = modalBottom - 35;
    const btnHeight = 38;
    const btnRadius = 19;

    // Cancel button - rounded pill
    const cancelBtnWidth = 110;
    const cancelBtnX = 240;
    
    const cancelBtnGraphics = this.scene.add.graphics();
    cancelBtnGraphics.fillStyle(0x444444, 0.8);
    cancelBtnGraphics.fillRoundedRect(cancelBtnX - cancelBtnWidth/2, buttonY - btnHeight/2, cancelBtnWidth, btnHeight, btnRadius);
    this.container.add(cancelBtnGraphics);
    
    const cancelBtnHitArea = this.scene.add.rectangle(cancelBtnX, buttonY, cancelBtnWidth, btnHeight, 0x000000, 0);
    cancelBtnHitArea.setInteractive({ useHandCursor: true });
    this.container.add(cancelBtnHitArea);

    const cancelText = this.scene.add.text(cancelBtnX, buttonY, "Annuler", {
      fontSize: "14px",
      fontFamily: "serif",
      color: "#cccccc"
    }).setOrigin(0.5);
    this.container.add(cancelText);

    // Reset to Default button - rounded pill
    const resetBtnWidth = 110;
    const resetBtnX = 400;
    
    const resetBtnGraphics = this.scene.add.graphics();
    resetBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.6);
    resetBtnGraphics.fillRoundedRect(resetBtnX - resetBtnWidth/2, buttonY - btnHeight/2, resetBtnWidth, btnHeight, btnRadius);
    this.container.add(resetBtnGraphics);
    
    const resetBtnHitArea = this.scene.add.rectangle(resetBtnX, buttonY, resetBtnWidth, btnHeight, 0x000000, 0);
    resetBtnHitArea.setInteractive({ useHandCursor: true });
    this.container.add(resetBtnHitArea);

    const resetText = this.scene.add.text(resetBtnX, buttonY, "Par défaut", {
      fontSize: "14px",
      fontFamily: "serif",
      color: "#ffffff"
    }).setOrigin(0.5);
    this.container.add(resetText);

    // Save button - rounded pill
    const saveBtnWidth = 110;
    const saveBtnX = 560;
    
    const saveBtnGraphics = this.scene.add.graphics();
    saveBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 1);
    saveBtnGraphics.fillRoundedRect(saveBtnX - saveBtnWidth/2, buttonY - btnHeight/2, saveBtnWidth, btnHeight, btnRadius);
    this.container.add(saveBtnGraphics);
    
    const saveBtnHitArea = this.scene.add.rectangle(saveBtnX, buttonY, saveBtnWidth, btnHeight, 0x000000, 0);
    saveBtnHitArea.setInteractive({ useHandCursor: true });
    this.container.add(saveBtnHitArea);

    const saveText = this.scene.add.text(saveBtnX, buttonY, "Enregistrer", {
      fontSize: "14px",
      fontFamily: "serif",
      color: "#000000",
      fontStyle: "bold"
    }).setOrigin(0.5);
    this.container.add(saveText);

    // Hover effects
    cancelBtnHitArea.on('pointerover', () => {
      cancelBtnGraphics.clear();
      cancelBtnGraphics.fillStyle(0x555555, 1);
      cancelBtnGraphics.fillRoundedRect(cancelBtnX - cancelBtnWidth/2, buttonY - btnHeight/2, cancelBtnWidth, btnHeight, btnRadius);
      cancelText.setColor("#ffffff");
    });

    cancelBtnHitArea.on('pointerout', () => {
      cancelBtnGraphics.clear();
      cancelBtnGraphics.fillStyle(0x444444, 0.8);
      cancelBtnGraphics.fillRoundedRect(cancelBtnX - cancelBtnWidth/2, buttonY - btnHeight/2, cancelBtnWidth, btnHeight, btnRadius);
      cancelText.setColor("#cccccc");
    });

    resetBtnHitArea.on('pointerover', () => {
      resetBtnGraphics.clear();
      resetBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 1);
      resetBtnGraphics.fillRoundedRect(resetBtnX - resetBtnWidth/2, buttonY - btnHeight/2, resetBtnWidth, btnHeight, btnRadius);
    });

    resetBtnHitArea.on('pointerout', () => {
      resetBtnGraphics.clear();
      resetBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.6);
      resetBtnGraphics.fillRoundedRect(resetBtnX - resetBtnWidth/2, buttonY - btnHeight/2, resetBtnWidth, btnHeight, btnRadius);
    });

    saveBtnHitArea.on('pointerover', () => {
      saveBtnGraphics.clear();
      saveBtnGraphics.fillStyle(0xffe066, 1);
      saveBtnGraphics.fillRoundedRect(saveBtnX - saveBtnWidth/2, buttonY - btnHeight/2, saveBtnWidth, btnHeight, btnRadius);
    });

    saveBtnHitArea.on('pointerout', () => {
      saveBtnGraphics.clear();
      saveBtnGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 1);
      saveBtnGraphics.fillRoundedRect(saveBtnX - saveBtnWidth/2, buttonY - btnHeight/2, saveBtnWidth, btnHeight, btnRadius);
    });

    // Click handlers
    cancelBtnHitArea.on('pointerdown', () => {
      this.hide();
    });

    resetBtnHitArea.on('pointerdown', () => {
      this.resetToDefaults();
    });

    saveBtnHitArea.on('pointerdown', () => {
      this.save();
    });
  }

  /**
   * Save and close
   */
  save() {
    if (this.onSaveCallback) {
      // Collect all parameter values
      const values = {};
      this.parameterControls.forEach(control => {
        values[control.param.key] = control.getValue();
      });
      
      this.onSaveCallback(values);
    }
    this.hide();
  }

  /**
   * Reset all parameters to their default values
   */
  resetToDefaults() {
    if (!this.currentFeature || !this.currentFeature.parameters) {
      return;
    }

    // Update all controls with default values
    this.parameterControls.forEach(control => {
      const param = control.param;
      const defaultValue = param.default;

      if (param.type === 'number') {
        // Update the control's getValue to return default
        control.getValue = () => defaultValue;

        // Find and update the visual elements
        const trackGraphics = control.trackGraphics;
        const sliderHandle = control.handle;
        const valueText = control.valueText;
        const sliderX = control.sliderX;
        const sliderWidth = control.sliderWidth;

        if (trackGraphics && sliderHandle && valueText) {
          const trackWidth = ((defaultValue - param.min) / (param.max - param.min)) * sliderWidth;
          const y = sliderHandle.y;
          
          // Update track graphics
          trackGraphics.clear();
          trackGraphics.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 1);
          trackGraphics.fillRoundedRect(sliderX - sliderWidth/2, y - 3, trackWidth, 6, 3);

          const handleX = sliderX - sliderWidth/2 + trackWidth;
          this.scene.tweens.add({
            targets: sliderHandle,
            x: handleX,
            duration: 200,
            ease: 'Sine.easeOut'
          });

          valueText.setText(defaultValue.toFixed(param.step < 1 ? 1 : 0));
        }
      } else if (param.type === 'boolean') {
        // Update toggle
        control.getValue = () => defaultValue;
        
        const toggleBgGraphics = control.toggleBgGraphics;
        const toggleHandle = control.toggleHandle;
        const toggleX = control.toggleX;
        const toggleWidth = control.toggleWidth;
        const toggleHeight = control.toggleHeight;
        const handleRadius = control.handleRadius;
        const stateText = control.stateText;
        const y = toggleHandle.y;
        
        if (toggleBgGraphics && toggleHandle && stateText) {
          toggleBgGraphics.clear();
          toggleBgGraphics.fillStyle(defaultValue ? DESIGN_CONSTANTS.COLORS.GOLD : 0x444444, 1);
          toggleBgGraphics.fillRoundedRect(toggleX - toggleWidth/2, y - toggleHeight/2, toggleWidth, toggleHeight, toggleHeight/2);
          
          const targetX = defaultValue ? toggleX + toggleWidth/2 - handleRadius - 3 : toggleX - toggleWidth/2 + handleRadius + 3;
          this.scene.tweens.add({
            targets: toggleHandle,
            x: targetX,
            duration: 150,
            ease: 'Sine.easeInOut'
          });

          stateText.setText(defaultValue ? "ON" : "OFF");
          stateText.setColor(defaultValue ? "#ffffff" : "#666666");
        }
      }
    });

    // Visual feedback - subtle flash
    this.scene.cameras.main.flash(150, 80, 160, 80, false);
  }

  /**
   * Hide the modal
   */
  hide() {
    if (!this.isVisible || !this.container) {
      return;
    }

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        if (this.container) {
          this.container.destroy();
          this.container = null;
        }
      }
    });

    this.isVisible = false;
    this.onSaveCallback = null;
    this.parameterControls = [];
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.isVisible = false;
    this.onSaveCallback = null;
    this.parameterControls = [];
  }
}
