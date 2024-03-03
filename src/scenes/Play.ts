import { Player } from "../entities/Player";

type MinMax = { min: number, max: number};

export class Play extends Phaser.Scene {

  get gameHeight() {
    return this.scale.height;
  }

  player: Player;
  ground: Phaser.GameObjects.TileSprite;
  startTrigger: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  gameStarted: boolean
  spawnInterval: number = 1500;
  spawnTimer: number = 0;
  spawnXRange: MinMax = { min: 600, max: 900 };
  gameSpeed: number = 300;
  obstacles: Phaser.Physics.Arcade.Group;

  constructor() {
    super('Play');
  }

  create() {
    this.initEnvironment();
    this.initPlayer();
    this.initStartTrigger();
  }

  update(time: number, delta: number): void {
    if(!this.gameStarted) {
      return;
    }
    
    this.spawnTimer += delta;
    if(this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnObstacle();
    }
  }

  initEnvironment() {
    this.ground = this.add.tileSprite(0, this.scale.height, 88, 26, 'ground')
      .setOrigin(0, 1);

    this.obstacles = this.physics.add.group();
    this.obstacles.setVelocityX(-200);
  }

  initPlayer() {
    this.player = new Player(this, 0, this.gameHeight);
  }

  initStartTrigger() {
    this.startTrigger = this.physics.add.sprite(0, 10, null)
      .setAlpha(0) 
      .setOrigin(0, 1);

    this.physics.add.overlap(this.player, this.startTrigger, () => {
      if(this.startTrigger.y === 10) {
        this.gameStarted = true;
        this.startTrigger.body.reset(0, this.gameHeight);
        return;
      }

      //When the player hits the ground on the first jump we can then start the game
      this.startTrigger.body.reset(9999, 9999);
      this.startGame();
    });
  }

  startGame() {
    //Grow the floor and then start running!
    this.tweens.add({
      targets: this.ground,
      width: 1000,
      duration: 500,
      ease: 'Linear',
      callbackScope: this,
      onComplete: () => {
        this.player.run();
        this.obstacles.setVelocityX(-200);
      },
    });
    
  }

  spawnObstacle() {
    const obstacleNumber = Math.floor(Math.random() * 6) + 1;
    const distance = Phaser.Math.Between(this.spawnXRange.min, this.spawnXRange.max);
    (this.obstacles
      .create(distance, this.gameHeight, `obstacle-${obstacleNumber}`) as Phaser.Physics.Arcade.Image)
      .setImmovable(true)
      .setOrigin(0, 1)
      .setVelocityX(-this.gameSpeed);
  }
}