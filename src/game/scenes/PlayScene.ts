import { Player } from "../../entities/Player";
import { SpriteWithDynamicBody } from "../../types";
import { PRELOAD_CONFIG } from "../main";
import { GameScene } from "./GameScene";

export class PlayScene extends GameScene {
  player: Player;
  ground: Phaser.GameObjects.TileSprite;
  obstacles: Phaser.Physics.Arcade.Group;
  clouds: Phaser.GameObjects.Group;
  startTrigger: SpriteWithDynamicBody;

  highScoreText: Phaser.GameObjects.Text;
  scoreText: Phaser.GameObjects.Text;
  gameOverText: Phaser.GameObjects.Image;
  restartText: Phaser.GameObjects.Image;
  gameOverContainer: Phaser.GameObjects.Container;

  score: number = 0;
  scoreInterval: number = 100;
  scoreDeltaTime: number = 0;

  spawnInterval: number = 1500;
  spawnTime: number = 0;
  gameSpeed: number = 5;
  gameSpeedModifier: number = 1;

  progressSound: Phaser.Sound.HTML5AudioSound;
  startButton: Phaser.GameObjects.Text;
  StartGameContainer: Phaser.GameObjects.Container;

  constructor() {
    super("PlayScene");
  }

  create() {
    this.createEnvironment();
    this.createPlayer();
    this.createObstacles();
    this.createGameoverContainer();
    this.createScore();

    this.handleGameStart();
    this.handleObstacleCollisions();
    this.handleGameRestart();

    this.createStartGameButton();

    this.progressSound = this.sound.add("progress", {
      volume: 0.2,
    }) as Phaser.Sound.HTML5AudioSound;
  }

  update(_time: number, delta: number): void {
    if (!this.isGameRunning) {
      return;
    }

    this.spawnTime += delta;
    this.scoreDeltaTime += delta;

    if (this.scoreDeltaTime >= this.scoreInterval) {
      this.score++;
      this.scoreDeltaTime = 0;

      if (this.score % 100 === 0) {
        this.gameSpeedModifier += 0.2;
        this.progressSound.play();
        this.tweens.add({
          targets: this.scoreText,
          duration: 100,
          repeat: 3,
          alpha: 0,
          yoyo: true,
        });
      }
    }

    if (this.spawnTime >= this.spawnInterval) {
      this.spawnObstacle();
      this.spawnTime = 0;
    }

    // > force all children x speed to +/- together
    Phaser.Actions.IncX(
      this.obstacles.getChildren(),
      -this.gameSpeed * this.gameSpeedModifier
    );
    Phaser.Actions.IncX(this.clouds.getChildren(), -0.5);

    const score = Array.from(String(this.score), Number);
    for (let i = 0; i < 5 - String(this.score).length; i++) {
      score.unshift(0);
    }
    this.scoreText.setText(score.join(""));

    // > technique remove object because have spawn logic in spawnInterval
    (this.obstacles.getChildren() as SpriteWithDynamicBody[]).forEach(
      (obstacle: SpriteWithDynamicBody) => {
        if (obstacle.getBounds().right < 0) {
          this.obstacles.remove(obstacle);
        }
      }
    );

    // > technique warp coordinate
    (this.clouds.getChildren() as SpriteWithDynamicBody[]).forEach(
      (cloud: SpriteWithDynamicBody) => {
        if (cloud.getBounds().right < 0) {
          cloud.x = this.gameWidth + 30;
        }
      }
    );

    // > this run the ground 
    this.ground.tilePositionX += this.gameSpeed * this.gameSpeedModifier;
  }

  spawnObstacle() {
    const obsticlesCount =
      PRELOAD_CONFIG.cactusesCount + PRELOAD_CONFIG.birdsCount;
    const obstacleNum = Math.floor(Math.random() * obsticlesCount) + 1;
    // const obstacleNum = 7;

    const distance = Phaser.Math.Between(150, 300);
    let obstacle;

    if (obstacleNum > PRELOAD_CONFIG.cactusesCount) {
      const enemyPossibleHeight = [20, 70];
      const enemyHeight = enemyPossibleHeight[Math.floor(Math.random() * 2)];

      obstacle = this.obstacles.create(
        this.gameWidth + distance,
        this.gameHeight - enemyHeight,
        `enemy-bird`
      );
      obstacle.play("enemy-bird-fly", true);
    } else {
      obstacle = this.obstacles.create(
        this.gameWidth + distance,
        this.gameHeight,
        `obstacle-${obstacleNum}`
      );
    }

    obstacle.setOrigin(0, 1).setImmovable();
  }

  createEnvironment() {
    // > tileSprite for tiled
    this.ground = this.add
      .tileSprite(0, this.gameHeight, 88, 26, "ground")
      .setOrigin(0, 1);

    this.clouds = this.add
      .group()
      .addMultiple([
        this.add.image(this.gameWidth / 2, 170, "cloud"),
        this.add.image(this.gameWidth - 80, 80, "cloud"),
        this.add.image(this.gameWidth / 1.3, 100, "cloud"),
      ]);

    this.clouds.setAlpha(0);
  }

  createPlayer() {
    this.player = new Player(this, 0, this.gameHeight);
  }

  createObstacles() {
    this.obstacles = this.physics.add.group();
  }

  createGameoverContainer() {
    this.gameOverText = this.add.image(0, 0, "game-over");
    this.restartText = this.add
      .image(0, 80, "restart")
      .setInteractive()
      .setOrigin(1, 0)
      .setTint(0xff0000); // Red tint - bottom-left
    const restartText2 = this.add
      .image(0, 80, "restart")
      .setInteractive()
      .setOrigin(0, 1)
      .setTint(0x00ff00); // Green tint - top-right
    const restartText3 = this.add
      .image(0, 80, "restart")
      .setInteractive()
      .setOrigin(0, 0)
      .setTint(0x0000ff); // Blue tint - bottom-righ
    const restartText4 = this.add
      .image(0, 80, "restart")
      .setInteractive()
      .setOrigin(1, 1)
      .setTint(0xffff00); // Yellow tint - bottom-left
    const restartText5 = this.add
      .image(0, 80, "restart")
      .setInteractive()
      .setOrigin(0.5, 0.5)
      .setTint(0xff00ff); // Magenta tint - center

    this.gameOverContainer = this.add
      .container(this.gameWidth / 2, this.gameHeight / 2 - 50)
      .add([
        this.gameOverText,
        this.restartText,
        restartText2,
        restartText3,
        restartText4,
        restartText5,
      ])
      .setAlpha(0);
  }

  createStartGameButton() {
    const buttonWidth = 220;
    const buttonHeight = 60;
    const borderRadius = 12;
    
    // Create a rounded background using graphics
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x000000, 0.4);
    buttonBg.fillRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      borderRadius
    );
    buttonBg.lineStyle(5, 0xffffff);
    buttonBg.strokeRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      borderRadius
    );

    // Create the text
    this.startButton = this.add
      .text(0, 0, "Start Game", {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Hover effects
    this.startButton.on("pointerover", () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x000000, 0.5);
      buttonBg.fillRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        borderRadius
      );
      buttonBg.lineStyle(2, 0x00ffcc);
      buttonBg.strokeRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        borderRadius
      );
    });

    this.startButton.on("pointerout", () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x000000, 0.4);
      buttonBg.fillRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        borderRadius
      );
      buttonBg.lineStyle(2, 0xffffff);
      buttonBg.strokeRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        borderRadius
      );
    });

    // Container
    this.StartGameContainer = this.add
      .container(this.gameWidth / 2, this.gameHeight / 2 - 50)
      .add([buttonBg, this.startButton])
      .setAlpha(1);

    // Click logic
    this.startButton.on("pointerdown", () => {
      const sound = this.sound;
      if ("context" in sound && sound.context.state === "suspended") {
        sound.context.resume();
      }

      this.StartGameContainer.setAlpha(0);
      this.isGameRunning = true;
    });
  }

  createAnimations() {
    this.anims.create({
      key: "enemy-bird-fly",
      frames: this.anims.generateFrameNumbers("enemy-bird"),
      frameRate: 6,
      repeat: -1,
    });
  }

  createScore() {
    this.scoreText = this.add
      .text(this.gameWidth, 0, "00000", {
        fontSize: 30,
        fontFamily: "Arial",
        color: "#535353",
        resolution: 5,
      })
      .setOrigin(1, 0)
      .setAlpha(0);

    this.highScoreText = this.add
      .text(this.scoreText.getBounds().left - 20, 0, "00000", {
        fontSize: 30,
        fontFamily: "Arial",
        color: "#535353",
        resolution: 5,
      })
      .setOrigin(1, 0)
      .setAlpha(0);
  }

  handleGameStart() {
    this.startTrigger = this.physics.add
      // .sprite(0, 10, "__DEFAULT") // > technique to pause game until player enter certain button
      .sprite(0, this.gameHeight, "__DEFAULT")
      .setAlpha(0)
      .setOrigin(0, 1);

    // > under the hood overlap run checker function that keep running forever like update
    this.physics.add.overlap(this.startTrigger, this.player, () => {
      // > technique to pause game until player enter certain button
      if (this.startTrigger.y === 10) {
        this.startTrigger.body.reset(0, this.gameHeight);
        return;
      }

      this.startTrigger.body.reset(9999, 9999);

      const rollOutEvent = this.time.addEvent({
        delay: 1000 / 60,
        loop: true,
        callback: () => {
          this.player.playRunAnimation();
          this.player.setVelocityX(80);
          this.ground.width += 17 * 2; // > contain tilesprite ground

          if (this.ground.width >= this.gameWidth) {
            rollOutEvent.remove();
            this.ground.width = this.gameWidth;
            this.player.setVelocityX(0);
            this.clouds.setAlpha(1);
            this.scoreText.setAlpha(1);
            this.isGameRunning = false;
          }
        },
      });
    });
  }

  handleObstacleCollisions() {
    this.physics.add.collider(this.obstacles, this.player, () => {
      this.isGameRunning = false;
      this.physics.pause();
      this.anims.pauseAll();

      this.player.die();
      this.gameOverContainer.setAlpha(1);

      const newHighScore = this.highScoreText.text.substring(
        this.highScoreText.text.length - 5
      );
      const newScore =
        Number(this.scoreText.text) > Number(newHighScore)
          ? this.scoreText.text
          : newHighScore;

      this.highScoreText.setText("HI " + newScore);
      this.highScoreText.setAlpha(1);

      this.spawnTime = 0;
      this.score = 0;
      this.scoreDeltaTime = 0;
      this.gameSpeedModifier = 1;
    });
  }

  handleGameRestart() {
    // > this is inside gameOver container
    this.restartText.on("pointerdown", () => {
      this.physics.resume();
      this.player.setVelocityY(0);

      this.obstacles.clear(true, true);
      this.gameOverContainer.setAlpha(0);
      this.startButton.disableInteractive();
      this.anims.resumeAll();

      this.isGameRunning = true;
    });
  }
}
