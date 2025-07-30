import { Scene } from "phaser";
import { PRELOAD_CONFIG } from "../main";

export class Preloader extends Scene {
  bar: Phaser.GameObjects.Rectangle;
  constructor() {
    super("Preloader");
  }

  init() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const barWidth = 468;

    // Optional: background fill matching game size
    this.add.rectangle(
      centerX,
      centerY,
      this.scale.width,
      this.scale.height,
      0x000000
    );

    // Outer border of Red loading bar
    this.add
      .rectangle(centerX, centerY, barWidth, 32)
      .setStrokeStyle(2, 0xffffff);

    // Red loading bar
    this.bar = this.add
      .rectangle(centerX - barWidth / 2, centerY, 4, 28, 0xff0000)
      .setOrigin(0.1, 0.5); // > this is starter base, but will stretch if u increment the width

    let progressCallCount = 0;

    this.add
      .text(centerX, centerY - 40  , "Dino Run", {
        fontSize: "32px",
        color: "#ffffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5, 0.5); // ax bx cx 

    //  > Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", async (progress: number) => {
      progressCallCount++;
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          // > you can consider progress same as each success 200 loaded assets
          this.bar.width = barWidth * progress;
          resolve();
        }, 100 * progressCallCount);
      });
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");

    this.load.image("ground", "ground.png");
    this.load.image("dino-idle", "dino-idle-2.png");
    this.load.image("dino-hurt", "dino-hurt.png");

    this.load.image("restart", "restart.png");
    this.load.image("game-over", "game-over.png");
    this.load.image("cloud", "cloud.png");

    this.load.audio("jump", "jump.m4a");
    this.load.audio("hit", "hit.m4a");
    this.load.audio("progress", "reach.m4a");

    for (let i = 0; i < PRELOAD_CONFIG.cactusesCount; i++) {
      const cactusNum = i + 1;
      this.load.image(`obstacle-${cactusNum}`, `cactuses_${cactusNum}.png`);
    }

    this.load.spritesheet("dino-run", "dino-run.png", {
      frameWidth: 88,
      frameHeight: 94,
    });

    this.load.spritesheet("dino-down", "dino-down-2.png", {
      frameWidth: 118,
      frameHeight: 94,
    });

    this.load.spritesheet("enemy-bird", "enemy-bird.png", {
      frameWidth: 92,
      frameHeight: 77,
    });
  }

  create() {
    // > create animations

    this.anims.create({
      key: "dino-run",
      frames: this.anims.generateFrameNames("dino-run", { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dino-down",
      frames: this.anims.generateFrameNames("dino-down"),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "enemy-bird-fly",
      frames: this.anims.generateFrameNumbers("enemy-bird"),
      frameRate: 6,
      repeat: -1,
    });

    //  > Move to the PlayScene. You could also swap this for a Scene Transition, such as a camera fade.
    this.time.delayedCall(500, () => {
      console.log("Fake load complete");
      this.scene.start("PlayScene");
    });

    // this.scene.start("PlayScene");
  }
}

// @ notes about setOrigin:

//    +-----------------------------+  ← GameObject bounds (e.g. text box)
//    |                             |
//    |       "Dino Run"            |
//    |                             |
//    +-----------------------------+

//    Origin points (x, y):



//     ax bx cx
//     ay by cy
//     az bz cz

//    (0, 0)       (0.5, 0)         (1, 0)
//    ┌──────────┬──────────────┬──────────────┐
//    │ Top-Left │  Top-Center  │  Top-Right   │
//    └──────────┴──────────────┴──────────────┘

//    (0, 0.5)     (0.5, 0.5)       (1, 0.5)
//    ┌──────────┬──────────────┬──────────────┐
//    │ Mid-Left │   CENTER     │ Mid-Right    │
//    └──────────┴──────────────┴──────────────┘

//     (0, 1)       (0.5, 1)         (1, 1)
//    ┌──────────┬──────────────┬──────────────┐
//    │Bot-Left  │ Bottom-Center│  Bot-Right   │
//    └──────────┴──────────────┴──────────────┘

// example:

// this.add.rectangle(100, 40, 50, 20, 0xff0000).setOrigin(0, 0);
// Width = 50, Height = 20

// setOrigin(0, 0) → anchor is top-left
// It will draw from (100, 40) → growing right and down.
// So bottom-right corner ends at (150, 60)
