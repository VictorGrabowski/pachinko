import Phaser from "phaser";

/**
 * Preload scene - loads all game assets
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    // Create loading bar
    this.createLoadingBar();

    // In a real game, load actual assets here
    // this.load.image('ball', '/assets/sprites/ball.png');
    // this.load.audio('koto', '/assets/audio/koto.mp3');
  }

  create() {
    // Move to menu scene
    this.scene.start("MenuScene");
  }

  /**
   * Create visual loading progress bar
   */
  createLoadingBar() {
    const width = 400;
    const height = 30;
    const x = (this.cameras.main.width - width) / 2;
    const y = this.cameras.main.height / 2;

    // Background bar
    const bgBar = this.add.graphics();
    bgBar.fillStyle(0x2e3a59);
    bgBar.fillRect(x, y, width, height);

    // Progress bar
    const progressBar = this.add.graphics();

    // Loading text
    const loadingText = this.add
      .text(this.cameras.main.width / 2, y - 40, "読込中...", {
        fontSize: "24px",
        color: "#F4A460",
        fontFamily: "serif",
      })
      .setOrigin(0.5);

    // Update progress
    this.load.on("progress", (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xf4a460);
      progressBar.fillRect(x, y, width * value, height);
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      bgBar.destroy();
      loadingText.destroy();
    });
  }
}
