import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";
import LanguageManager from "../managers/LanguageManager.js";
import AchievementManager from "../managers/AchievementManager.js";

export default class AchievementsScene extends Phaser.Scene {
    constructor() {
        super({ key: "AchievementsScene" });
    }

    create() {
        this.languageManager = LanguageManager;
        this.achievementManager = AchievementManager;
        this.trophyElements = [];

        // Background
        const bg = this.add.rectangle(400, 500, 800, 1000, DESIGN_CONSTANTS.COLORS.BACKGROUND);
        bg.setAlpha(0.95);

        // Sakura particles
        this.createSakuraEffect();

        // Title
        const titleText = this.add.text(400, 80, this.languageManager.getText("achievements.title"), {
            fontSize: "48px",
            fontFamily: "serif",
            color: "#FFD700",
            fontStyle: "bold",
            stroke: "#000",
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.shelfTitle = this.add.text(400, 140, this.languageManager.getText("achievements.shelf") || "Trophy Shelf", {
            fontSize: "24px",
            fontFamily: "serif",
            color: "#F4A460",
        }).setOrigin(0.5);

        // Create the tooltip first so it's behind the shelf but above trophies? 
        // Actually tooltips should be top-most.
        this.createTooltip();

        // Create the shelf and trophies
        this.createTrophyShelf();

        // Back button
        this.createBackButton();

        this.cameras.main.fadeIn(500);
    }

    createSakuraEffect() {
        this.add.particles(0, 0, "petal", {
            x: { min: 0, max: 800 },
            y: -50,
            lifespan: 8000,
            speedY: { min: 30, max: 60 },
            speedX: { min: -15, max: 15 },
            scale: { start: 0.3, end: 0.1 },
            alpha: { start: 0.6, end: 0 },
            rotate: { start: 0, end: 360 },
            frequency: 400,
        });
    }

    createTrophyShelf() {
        const achievements = this.achievementManager.getAllAchievements();
        const startX = 140;
        const startY = 250;
        const paddingX = 130;
        const paddingY = 180;
        const itemsPerRow = 5;

        // Draw shelves as simple lines or rectangles
        const graphics = this.add.graphics();
        graphics.lineStyle(8, 0x8B4513, 0.8); // Brown shelf
        graphics.fillStyle(0x5D2906, 0.9);

        const numRows = Math.ceil(achievements.length / itemsPerRow);
        for (let r = 0; r < numRows; r++) {
            const shelfY = startY + (r * paddingY) + 70;
            graphics.fillRect(startX - 60, shelfY, (itemsPerRow - 1) * paddingX + 120, 15);
            graphics.strokeRect(startX - 60, shelfY, (itemsPerRow - 1) * paddingX + 120, 15);
        }

        achievements.forEach((ach, index) => {
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            const x = startX + col * paddingX;
            const y = startY + row * paddingY;

            this.createTrophy(x, y, ach);
        });
    }

    createTrophy(x, y, ach) {
        const trophyContainer = this.add.container(x, y);

        // Trophy base
        const base = this.add.graphics();
        const color = ach.unlocked ? 0xFFD700 : 0x444444; // Gold or Gray
        base.fillStyle(color, 1);

        // Simple trophy shape with graphics
        // base
        base.fillRect(-25, 45, 50, 10);
        // stem
        base.fillRect(-5, 30, 10, 15);
        // cup
        base.beginPath();
        base.moveTo(-20, 0);
        base.lineTo(20, 0);
        base.lineTo(15, 30);
        base.lineTo(-15, 30);
        base.closePath();
        base.fillPath();

        // Icon on trophy
        const icon = this.add.text(0, 10, ach.icon, {
            fontSize: '24px'
        }).setOrigin(0.5);

        if (!ach.unlocked) {
            icon.setAlpha(0.3);
            base.setAlpha(0.5);
        }

        // Name below
        const name = this.add.text(0, 65, ach.name, {
            fontSize: '12px',
            fontFamily: 'serif',
            color: ach.unlocked ? '#F4A460' : '#888888',
            align: 'center',
            wordWrap: { width: 100 }
        }).setOrigin(0.5);

        trophyContainer.add([base, icon, name]);

        // Hit area for hover
        const hitArea = this.add.rectangle(0, 30, 100, 140, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        trophyContainer.add(hitArea);

        hitArea.on('pointerover', () => {
            this.showTooltip(x, y - 60, ach);
            this.tweens.add({
                targets: trophyContainer,
                scale: 1.1,
                duration: 150,
                ease: 'Back.easeOut'
            });
        });

        hitArea.on('pointerout', () => {
            this.hideTooltip();
            this.tweens.add({
                targets: trophyContainer,
                scale: 1,
                duration: 150
            });
        });
    }

    createTooltip() {
        this.tooltip = this.add.container(0, 0).setVisible(false).setDepth(100);

        const bg = this.add.rectangle(0, 0, 250, 80, 0x000000, 0.9);
        bg.setStrokeStyle(2, 0xFFD700);

        this.tooltipTitle = this.add.text(0, -20, "", {
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#FFD700'
        }).setOrigin(0.5);

        this.tooltipDesc = this.add.text(0, 10, "", {
            fontSize: '14px',
            color: '#FFFFFF',
            align: 'center',
            wordWrap: { width: 230 }
        }).setOrigin(0.5);

        this.tooltipStatus = this.add.text(0, 35, "", {
            fontSize: '10px',
            color: '#888888',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        this.tooltip.add([bg, this.tooltipTitle, this.tooltipDesc, this.tooltipStatus]);
    }

    showTooltip(x, y, ach) {
        this.tooltip.setPosition(x, y);
        this.tooltip.setVisible(true);

        this.tooltipTitle.setText(ach.name);
        this.tooltipDesc.setText(ach.description);

        if (ach.unlocked) {
            this.tooltipStatus.setText("Débloqué !").setColor('#00FF00');
        } else {
            this.tooltipStatus.setText("Verrouillé").setColor('#FF0000');
        }
    }

    hideTooltip() {
        this.tooltip.setVisible(false);
    }

    createBackButton() {
        const buttonY = 920;
        const button = this.add.rectangle(400, buttonY, 250, 60, DESIGN_CONSTANTS.COLORS.PRIMARY);
        button.setStrokeStyle(3, DESIGN_CONSTANTS.COLORS.GOLD);
        button.setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(400, buttonY, this.languageManager.getText("scoreboard.back"), {
            fontSize: "24px",
            fontFamily: "serif",
            color: "#FFD700",
            fontStyle: "bold",
        }).setOrigin(0.5);

        button.on("pointerover", () => {
            button.setFillStyle(DESIGN_CONSTANTS.COLORS.GOLD);
            buttonText.setColor("#2E3A59");
            this.tweens.add({ targets: [button, buttonText], scaleX: 1.05, scaleY: 1.05, duration: 150 });
        });

        button.on("pointerout", () => {
            button.setFillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY);
            buttonText.setColor("#FFD700");
            this.tweens.add({ targets: [button, buttonText], scaleX: 1, scaleY: 1, duration: 150 });
        });

        button.on("pointerdown", () => {
            this.cameras.main.fadeOut(500);
            this.time.delayedCall(500, () => {
                this.scene.start("MenuScene");
            });
        });
    }
}
