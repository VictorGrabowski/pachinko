import Phaser from "phaser";
import { DESIGN_CONSTANTS } from "../config/gameConfig.js";
import LanguageManager from "../managers/LanguageManager.js";

// Define the tutorial structure content keys
const TUTORIAL_STRUCTURE = [
    {
        category: 'cat_mechanics',
        pages: [
            { title: 'mech_launch_title', content: 'mech_launch_desc', image: 'tutorial_launch' },
            { title: 'mech_score_title', content: 'mech_score_desc', image: 'tutorial_targets' }
        ]
    },
    {
        category: 'cat_features',
        pages: [
            { title: 'feat_lucky_title', content: 'feat_lucky_desc', image: 'tutorial_configuration' },
            { title: 'feat_mystery_title', content: 'feat_mystery_desc', image: 'tutorial_targets' }
        ]
    },
    {
        category: 'cat_powerups',
        pages: [
            { title: 'pup_golden_title', content: 'pup_golden_desc', image: 'tutorial_ball', tint: 0xFFD700 },
            { title: 'pup_ghost_title', content: 'pup_ghost_desc', image: 'tutorial_ball', alpha: 0.5 },
            { title: 'pup_magnet_title', content: 'pup_magnet_desc', image: 'tutorial_ball' }, // Magnet might need a specific color or icon, but ball is better than board
            { title: 'pup_multiball_title', content: 'pup_multiball_desc', image: 'tutorial_ball' },
            { title: 'pup_bigball_title', content: 'pup_bigball_desc', image: 'tutorial_ball', scale: 1.5 }
        ]
    },
    {
        category: 'cat_malus',
        pages: [
            { title: 'malus_yokai_title', content: 'malus_yokai_desc', special: 'yokai' },
            { title: 'malus_pins_title', content: 'malus_pins_desc', image: 'tutorial_configuration' }
        ]
    },
    {
        category: 'cat_settings',
        pages: [
            { title: 'set_hardcore_title', content: 'set_hardcore_desc', image: 'tutorial_configuration' }
        ]
    }
];

export default class TutorialOverlay {
    constructor(scene) {
        this.scene = scene;
        this.languageManager = LanguageManager;
        this.container = null;
        this.isVisible = false;

        // Flatten pages for linear navigation
        this.pages = [];
        this.sections = [];

        TUTORIAL_STRUCTURE.forEach(section => {
            this.sections.push({
                titleKey: `tutorial.${section.category}`,
                startIndex: this.pages.length + 1 // 1-based index (0 is menu)
            });

            section.pages.forEach(page => {
                this.pages.push(page);
            });
        });

        this.currentPage = 0; // 0 = Table of Contents
        this.totalPages = this.pages.length;
    }

    show() {
        if (this.isVisible) return;
        this.isVisible = true;
        this.currentPage = 0; // Always start at summary

        // Create container
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(1000); // High depth to be on top

        // Background dimmer
        const dimmer = this.scene.add.rectangle(400, 500, 800, 1000, 0x000000, 0.85);
        dimmer.setInteractive(); // Block clicks below
        this.container.add(dimmer);

        // Main panel
        const panelWidth = 700;
        const panelHeight = 800;
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
        this.titleText = this.scene.add.text(panelX, panelY - 350, this.languageManager.getText('tutorial.title'), {
            fontSize: "42px",
            fontFamily: "serif",
            color: "#FFD700",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.container.add(this.titleText);

        // Separator
        const sep = this.scene.add.rectangle(panelX, panelY - 310, 500, 2, DESIGN_CONSTANTS.COLORS.PRIMARY);
        sep.setAlpha(0.6);
        this.container.add(sep);

        // === CONTENT CONTAINERS ===

        // 1. Menu Container (TOC)
        this.menuContainer = this.scene.add.container(0, 0);
        this.createMenuContent(panelX, panelY);
        this.container.add(this.menuContainer);

        // 2. Page Container (Detail)
        this.pageContainer = this.scene.add.container(0, 0);
        this.pageContainer.setVisible(false);
        this.createPageContent(panelX, panelY);
        this.container.add(this.pageContainer);

        // Close Button
        this.createCloseButton(panelX + panelWidth / 2 - 40, panelY - panelHeight / 2 + 40);

        // Initial Render
        this.updateView();

        // Intro animation
        this.container.setAlpha(0);
        this.container.setScale(0.9);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            scale: 1,
            duration: 300,
            ease: 'Back.out'
        });
    }

    createMenuContent(centerX, centerY) {
        const startY = centerY - 220;

        this.sections.forEach((section, index) => {
            const y = startY + (index * 80);

            const btn = this.createButton(centerX, y, 400, 60, this.languageManager.getText(section.titleKey), () => {
                this.currentPage = section.startIndex;
                this.updateView();
            });

            this.menuContainer.add(btn);
        });

        // Instructions hint
        const hint = this.scene.add.text(centerX, centerY + 250, this.languageManager.getText('tutorial.menu'), {
            fontSize: "18px",
            fontFamily: "serif",
            color: "#AAAAAA",
            fontStyle: "italic"
        }).setOrigin(0.5);
        this.menuContainer.add(hint);
    }

    createPageContent(centerX, centerY) {
        // Page Title
        this.pageTitleText = this.scene.add.text(centerX, centerY - 250, "", {
            fontSize: "32px",
            fontFamily: "serif",
            color: "#F4A460",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.pageContainer.add(this.pageTitleText);

        // Content Body
        this.contentBodyText = this.scene.add.text(centerX, centerY + 120, "", {
            fontSize: "20px",
            fontFamily: "serif",
            color: "#FFFFFF",
            align: "center",
            wordWrap: { width: 600 },
            lineSpacing: 10
        }).setOrigin(0.5);
        this.pageContainer.add(this.contentBodyText);

        // Page Indicator
        this.pageIndicator = this.scene.add.text(centerX, centerY + 300, "1 / X", {
            fontSize: "18px",
            fontFamily: "serif",
            color: "#AAAAAA"
        }).setOrigin(0.5);
        this.pageContainer.add(this.pageIndicator);

        // Tutorial Image (Standard)
        this.tutorialImage = this.scene.add.image(centerX, centerY - 80, "tutorial_targets");
        this.tutorialImage.setDisplaySize(400, 220);
        this.pageContainer.add(this.tutorialImage);

        // Special: Yokai Container
        this.yokaiContainer = this.scene.add.container(centerX, centerY - 80);
        const yokaiSize = 80;
        const yokaiSpacing = 20;
        const totalWidth = 4 * yokaiSize + 3 * yokaiSpacing;
        const startX = -totalWidth / 2 + yokaiSize / 2;

        for (let i = 0; i < 4; i++) {
            const x = startX + i * (yokaiSize + yokaiSpacing);
            const yokaiImg = this.scene.add.image(x, 0, `yokai_${i + 1}`);
            yokaiImg.setDisplaySize(yokaiSize, yokaiSize);
            this.yokaiContainer.add(yokaiImg);
        }
        this.yokaiContainer.setVisible(false);
        this.pageContainer.add(this.yokaiContainer);

        // Navigation Buttons
        // Prev
        this.prevBtn = this.createNavButton(centerX - 200, centerY + 300, "tutorial.prev", () => this.changePage(-1));
        this.pageContainer.add(this.prevBtn);

        // Next
        this.nextBtn = this.createNavButton(centerX + 200, centerY + 300, "tutorial.next", () => this.changePage(1));
        this.pageContainer.add(this.nextBtn);

        // Menu (Back to TOC)
        this.menuBtn = this.createNavButton(centerX, centerY + 350, "tutorial.menu", () => {
            this.currentPage = 0;
            this.updateView();
        }, 120, 40, DESIGN_CONSTANTS.COLORS.ACCENT);
        this.pageContainer.add(this.menuBtn);
    }

    updateView() {
        if (this.currentPage === 0) {
            // Show Menu
            this.menuContainer.setVisible(true);
            this.pageContainer.setVisible(false);
            this.titleText.setText(this.languageManager.getText('tutorial.title'));
        } else {
            // Show Page
            this.menuContainer.setVisible(false);
            this.pageContainer.setVisible(true);

            const pageData = this.pages[this.currentPage - 1];
            if (!pageData) return;

            // Update text
            this.titleText.setText(this.languageManager.getText('tutorial.title')); // Keep main title constant or change?
            this.pageTitleText.setText(this.languageManager.getText(`tutorial.${pageData.title}`));
            this.contentBodyText.setText(this.languageManager.getText(`tutorial.${pageData.content}`));
            this.pageIndicator.setText(`${this.currentPage} / ${this.totalPages}`);

            // Update visuals
            if (pageData.special === 'yokai') {
                this.tutorialImage.setVisible(false);
                this.yokaiContainer.setVisible(true);
            } else {
                this.yokaiContainer.setVisible(false);
                this.tutorialImage.setVisible(true);
                // Use placeholder if image not found or specific logic
                // For now, reuse existing images based on context or use a default
                this.tutorialImage.setTexture(pageData.image || "tutorial_targets");

                // Apply modifiers if any
                this.tutorialImage.setTint(pageData.tint || 0xffffff);
                this.tutorialImage.setAlpha(pageData.alpha || 1);

                // Note: setDisplaySize might override scale, so reset it
                this.tutorialImage.setScale(1);
                this.tutorialImage.setDisplaySize(400, 220);
                if (pageData.scale) {
                    this.tutorialImage.setScale(this.tutorialImage.scaleX * pageData.scale, this.tutorialImage.scaleY * pageData.scale);
                }
            }

            // Update Nav Buttons
            this.prevBtn.setEnabled(this.currentPage > 1);
            this.nextBtn.setEnabled(this.currentPage < this.totalPages);
        }
    }

    changePage(delta) {
        const newPage = this.currentPage + delta;
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.currentPage = newPage;
            this.updateView();
        }
    }

    createButton(x, y, width, height, text, callback) {
        const container = this.scene.add.container(x, y);

        const bg = this.scene.add.graphics();
        bg.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 15);
        bg.lineStyle(2, 0xFFFFFF, 0.5);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 15);

        const hitArea = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });

        const label = this.scene.add.text(0, 0, text, {
            fontSize: "24px",
            fontFamily: "serif",
            color: "#FFFFFF",
            fontStyle: "bold"
        }).setOrigin(0.5);

        container.add([bg, hitArea, label]);

        hitArea.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.9);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 15);
            bg.lineStyle(2, 0xFFFFFF, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 15);
            label.setColor("#000000");
            this.scene.tweens.add({ targets: container, scale: 1.05, duration: 100 });
        });

        hitArea.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(DESIGN_CONSTANTS.COLORS.PRIMARY, 0.8);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 15);
            bg.lineStyle(2, 0xFFFFFF, 0.5);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 15);
            label.setColor("#FFFFFF");
            this.scene.tweens.add({ targets: container, scale: 1, duration: 100 });
        });

        hitArea.on('pointerdown', callback);

        return container;
    }

    createNavButton(x, y, textKey, callback, w = 140, h = 45, color = null) {
        const container = this.scene.add.container(x, y);
        const width = w;
        const height = h;
        const baseColor = color || DESIGN_CONSTANTS.COLORS.PRIMARY;

        const bg = this.scene.add.graphics();
        bg.fillStyle(baseColor, 0.8);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);

        const hitArea = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });

        const label = this.scene.add.text(0, 0, this.languageManager.getText(textKey), {
            fontSize: "18px",
            fontFamily: "serif",
            color: "#FFFFFF"
        }).setOrigin(0.5);

        container.add([bg, hitArea, label]);

        hitArea.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(DESIGN_CONSTANTS.COLORS.GOLD, 0.9);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
            label.setColor("#000000");
        });

        hitArea.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(baseColor, 0.8);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
            label.setColor("#FFFFFF");
        });

        hitArea.on('pointerdown', callback);

        container.setEnabled = (enabled) => {
            container.setVisible(enabled);
            container.setAlpha(enabled ? 1 : 0.5);
            if (enabled) hitArea.setInteractive();
            else hitArea.disableInteractive();
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

    hide() {
        if (!this.isVisible) return;

        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            scale: 0.9,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                this.container.destroy();
                this.container = null;
                this.isVisible = false;
            }
        });
    }
}
