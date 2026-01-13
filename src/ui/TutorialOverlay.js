import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";
import LanguageManager from "../managers/LanguageManager.js";

export default class TutorialOverlay {
    constructor(scene) {
        this.scene = scene;
        this.languageManager = LanguageManager;
        this.container = null;
        this.currentPage = 1;
        this.totalPages = 4;
        this.isVisible = false;
    }

    show() {
        if (this.isVisible) return;
        this.isVisible = true;
        this.currentPage = 1;

        // Create container
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(1000); // High depth to be on top

        // Background dimmer
        const dimmer = this.scene.add.rectangle(400, 500, 800, 1000, 0x000000, 0.8);
        dimmer.setInteractive(); // Block clicks below
        this.container.add(dimmer);

        // Main panel
        // Main panel
        const panelWidth = 600;
        const panelHeight = 700;
        const panelX = 400;
        const panelY = 500;
        const panelRadius = 24;

        const panelBg = this.scene.add.graphics();
        panelBg.fillStyle(DESIGN_CONSTANTS.COLORS.BACKGROUND, 0.98);
        panelBg.fillRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, panelRadius);
        panelBg.lineStyle(3, DESIGN_CONSTANTS.COLORS.GOLD, 0.8);
        panelBg.strokeRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, panelRadius);
        this.container.add(panelBg);

        // Title
        this.titleText = this.scene.add.text(panelX, panelY - 300, this.languageManager.getText('tutorial.title'), {
            fontSize: "36px",
            fontFamily: "serif",
            color: "#FFD700",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.container.add(this.titleText);

        // Separator
        const sep = this.scene.add.rectangle(panelX, panelY - 260, 400, 2, DESIGN_CONSTANTS.COLORS.PRIMARY);
        sep.setAlpha(0.5);
        this.container.add(sep);

        // Content Title
        this.pageTitleText = this.scene.add.text(panelX, panelY - 220, "", {
            fontSize: "28px",
            fontFamily: "serif",
            color: "#F4A460",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.container.add(this.pageTitleText);

        // Image Placeholder
        this.imagePlaceholder = this.scene.add.rectangle(panelX, panelY - 60, 400, 220, 0x000000, 0.3);
        this.imagePlaceholder.setStrokeStyle(2, DESIGN_CONSTANTS.COLORS.PRIMARY, 0.5);
        this.container.add(this.imagePlaceholder);

        this.imageText = this.scene.add.text(panelX, panelY - 60, "", {
            fontSize: "16px",
            color: "#666666",
            fontStyle: "italic"
        }).setOrigin(0.5);
        this.container.add(this.imageText);

        // Content Body
        this.contentBodyText = this.scene.add.text(panelX, panelY + 120, "", {
            fontSize: "18px",
            fontFamily: "serif",
            color: "#FFFFFF",
            align: "center",
            wordWrap: { width: 500 },
            lineSpacing: 8
        }).setOrigin(0.5);
        this.container.add(this.contentBodyText);

        // Page Indicator
        this.pageIndicator = this.scene.add.text(panelX, panelY + 280, `1 / ${this.totalPages}`, {
            fontSize: "18px",
            fontFamily: "serif",
            color: "#AAAAAA"
        }).setOrigin(0.5);
        this.container.add(this.pageIndicator);

        // Navigation Buttons
        this.createNavigationButtons(panelX, panelY + 280);

        // Close Button
        this.createCloseButton(panelX + panelWidth / 2 - 40, panelY - panelHeight / 2 + 40);

        // Initial Render
        this.updateContent();

        // Intro animation
        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }

    createNavigationButtons(centerX, y) {
        const buttonWidth = 140;
        const buttonHeight = 50;

        // Previous Button
        this.prevBtn = this.createButton(centerX - 150, y, this.languageManager.getText('tutorial.prev'), () => this.changePage(-1));
        this.container.add(this.prevBtn);

        // Next Button
        this.nextBtn = this.createButton(centerX + 150, y, this.languageManager.getText('tutorial.next'), () => this.changePage(1));
        this.container.add(this.nextBtn);
    }

    createButton(x, y, text, callback) {
        const container = this.scene.add.container(x, y);
        const width = 140;
        const height = 45;

        const bg = this.scene.add.graphics();
        bg.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 15);

        // Hit area
        const hitArea = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });

        const label = this.scene.add.text(0, 0, text, {
            fontSize: "18px",
            fontFamily: "serif",
            color: "#FFFFFF"
        }).setOrigin(0.5);

        container.add([bg, hitArea, label]);

        hitArea.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.9);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 15);
            label.setColor("#000000");
        });

        hitArea.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 15);
            label.setColor("#FFFFFF");
        });

        hitArea.on('pointerdown', callback);

        // Attach method to enable/disable button
        container.setEnabled = (enabled) => {
            container.setVisible(enabled);
        };

        return container;
    }

    createCloseButton(x, y) {
        const btn = this.scene.add.container(x, y);

        const bg = this.scene.add.circle(0, 0, 20, DESIGN_CONSTANTS.COLORS.ACCENT);
        const text = this.scene.add.text(0, 0, "X", {
            fontSize: "20px",
            fontFamily: "Arial",
            color: "#FFFFFF",
            fontWeight: "bold"
        }).setOrigin(0.5);

        const hitArea = this.scene.add.circle(0, 0, 20, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });

        btn.add([bg, text, hitArea]);
        this.container.add(btn);

        hitArea.on('pointerdown', () => this.hide());
        hitArea.on('pointerover', () => {
            bg.setFillStyle(0xff0000);
            this.scene.tweens.add({ targets: btn, scale: 1.1, duration: 100 });
        });
        hitArea.on('pointerout', () => {
            bg.setFillStyle(DESIGN_CONSTANTS.COLORS.ACCENT);
            this.scene.tweens.add({ targets: btn, scale: 1, duration: 100 });
        });
    }

    changePage(delta) {
        const newPage = this.currentPage + delta;
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.currentPage = newPage;
            this.updateContent();
        }
    }

    updateContent() {
        // Update Page Text
        const pageKey = `tutorial.page${this.currentPage}`;
        this.pageTitleText.setText(this.languageManager.getText(`${pageKey}_title`));
        this.contentBodyText.setText(this.languageManager.getText(`${pageKey}_content`));
        this.pageIndicator.setText(`${this.currentPage} / ${this.totalPages}`);

        // Update Image Placeholder Text (Temporary until real assets)
        const placeholderTexts = [
            "Aperçu: Cibles & Score",
            "Aperçu: Configuration Aléatoire",
            "Aperçu: Lancer & Rebonds",
            "Aperçu: Yokais & Mode Hardcore"
        ];
        this.imageText.setText(placeholderTexts[this.currentPage - 1]);

        // Update Buttons State
        this.prevBtn.setEnabled(this.currentPage > 1);
        this.nextBtn.setEnabled(this.currentPage < this.totalPages);

        // If on last page, change Next to Close potentially? Or just disable it.
        // For now, simple logic is fine.
    }

    hide() {
        if (!this.isVisible) return;

        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.container.destroy();
                this.container = null;
                this.isVisible = false;
            }
        });
    }
}
