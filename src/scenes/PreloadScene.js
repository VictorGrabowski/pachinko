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

    // Load audio assets (relative paths for Electron compatibility)
    this.load.audio("coin", "assets/coin.mp3");
    this.load.audio("bgMusic", "assets/bgMusic.mp3");

    // Load tutorial images
    this.load.image("tutorial_targets", "assets/tutorial/tutorial_targets.png");
    this.load.image("tutorial_configuration", "assets/tutorial/tutorial_configuration.png");
    this.load.image("tutorial_launch", "assets/tutorial/tutorial_launch.png");
    this.load.image("tutorial_yokais", "assets/tutorial/tutorial_yokais.png");
    this.load.image("tutorial_ball", "assets/tutorial/tutorial_ball.png");

    // Load yokai images for tutorial page 4
    this.load.image("yokai_1", "assets/tutorial/yokai_1.png");
    this.load.image("yokai_2", "assets/tutorial/yokai_2.png");
    this.load.image("yokai_3", "assets/tutorial/yokai_3.png");
    this.load.image("yokai_4", "assets/tutorial/yokai_4.png");
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
