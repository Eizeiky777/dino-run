import { Scene } from "phaser";
import { PRELOAD_CONFIG } from "../main";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, "background");

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
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
    this.scene.start("PlayScene");
  }
}
