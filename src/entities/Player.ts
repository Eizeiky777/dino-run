import Phaser from "phaser";
import { GameScene } from "../game/scenes/GameScene";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpSound: Phaser.Sound.BaseSound;
  private hitSound: Phaser.Sound.BaseSound;
  scene: GameScene;

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, "dino-run");
    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.init();
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  private init() {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();

    this.setOrigin(0, 1)
      .setGravityY(5000)
      .setCollideWorldBounds(true)
      .setBodySize(44, 92)
      .setOffset(20, 0)
      .setDepth(1);

    // this.registerAnimations();
    this.registerSounds();
  }

  update() {
    const { space, down } = this.cursors;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (!space || !down) return;

    const onFloor = body.onFloor();

    if (Phaser.Input.Keyboard.JustDown(space) && onFloor) {
      this.setVelocityY(-1600);
      this.jumpSound.play();
    }

    if (Phaser.Input.Keyboard.JustDown(down) && onFloor) {
      body.setSize(body.width, 58);
      this.setOffset(60, 34);
    }

    if (Phaser.Input.Keyboard.JustUp(down) && onFloor) {
      body.setSize(44, 92);
      this.setOffset(20, 0);
    }

    if (!this.scene.isGameRunning) return;

    if (!body.onFloor()) {
      this.anims.stop();
      this.setTexture("dino-run", 0); // > this will using index-0 as the static display
    } else {
      this.playRunAnimation();
    }
  }

  public playRunAnimation() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const isDucking = body.height <= 58;

    this.play(isDucking ? "dino-down" : "dino-run", true);
  }

  // private registerAnimations() {
  //   this.anims.create({
  //     key: "dino-run",
  //     frames: this.anims.generateFrameNames("dino-run", { start: 2, end: 3 }),
  //     frameRate: 10,
  //     repeat: -1,
  //   });

  //   this.anims.create({
  //     key: "dino-down",
  //     frames: this.anims.generateFrameNames("dino-down"),
  //     frameRate: 10,
  //     repeat: -1,
  //   });
  // }

  private registerSounds() {
    this.jumpSound = this.scene.sound.add("jump", { volume: 0.2 });
    this.hitSound = this.scene.sound.add("hit", { volume: 0.2 });
  }

  die() {
    this.anims.pause();
    this.setTexture("dino-hurt");
    this.hitSound.play();
  }
}
