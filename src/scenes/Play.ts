import { GAME_CONFIG } from '@/config';
import { ImageButton } from '@/entities/ImageButton';
import { Player } from '@/entities/Player';

type MinMax = { min: number, max: number};

export class Play extends Phaser.Scene {

  get gameHeight() {
    return this.scale.height;
  }

  isGameRunning: boolean = false;
  gameSpeed: number = 750;

  spawnInterval: number = 1500;
  cleanupTimer: number = 0;
  cleanupTimerInterval: number = 1000;
  spawnTimer: number = 0;
  spawnXRange: MinMax = { min: 600, max: 900 };

  gameOver: Phaser.GameObjects.Container;
  gameOverText: Phaser.GameObjects.Image;
  restartButton: Phaser.GameObjects.Image;

  player: Player;
  ground: Phaser.GameObjects.TileSprite;
  startTrigger: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  obstacles: Phaser.Physics.Arcade.Group;

  obstacleLookup: {type: 'cactus' | 'bird', key: string }[] = [];

  constructor() {
    super('Play');
    //Make an array from cactusCount and birdsCount on the GAME_CONFIG object
    for(let i = 1; i <= GAME_CONFIG.cactusCount; i++) {
      this.obstacleLookup.push({ type: 'cactus', key: `cactus-${i}` });
    }

    for(let i = 1; i <= GAME_CONFIG.birdsCount; i++) {
      this.obstacleLookup.push({ type: 'bird', key: `bird-${i}` });
    }
  }

  create() {
    this.initEnvironment();
    this.initGameOverScreen();
    this.initPlayer();
    this.initStartTrigger();

    this.handleCollisions();
  }

  update(time: number, delta: number): void {
    if(!this.isGameRunning) {
      return;
    }
    
    this.spawnTimer += delta;
    if(this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnObstacle();
    }

    this.cleanupTimer += delta;
    if(this.cleanupTimer >= this.cleanupTimerInterval) {
      this.cleanupTimer = 0;
      this.obstacles.getChildren().forEach((o: Phaser.Physics.Arcade.Image) => {
        if(o.getBounds().right < 0) {
          this.obstacles.remove(o, true, true);
        }
      }, this);
    }

    this.ground.tilePositionX += this.gameSpeed * delta / 1000;
  }

  initEnvironment() {
    this.ground = this.add.tileSprite(0, this.scale.height, 88, 26, 'ground')
      .setOrigin(0, 1);

    this.obstacles = this.physics.add.group();
  }

  initGameOverScreen() {
    const spacing = 30;
    this.gameOverText = this.add.image(0, -spacing, 'game-over')
    .setVisible(false)
    .setOrigin(0.5);

  this.restartButton = new ImageButton(this, { 
    x: 0, 
    y: spacing, 
    key: 'restart', 
    onClick: () => {
      this.handleRestart();
    },
    onClickThis: this,
  })
    .setOrigin(0.5)
    .setVisible(false);

    this.gameOver = this.add.container(this.scale.width / 2, this.scale.height / 2);
    this.gameOver.add([this.gameOverText, this.restartButton]);
    this.gameOver.setVisible(false);

    this.gameOverText.setVisible(true);
    this.restartButton.setVisible(true);
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
        this.isGameRunning = true;
        this.player.run();
        this.obstacles.setVelocityX(-200);
      },
    });
  }

  spawnObstacle() {
    const obstacleNumber = Math.floor(Math.random() * this.obstacleLookup.length) ;
    const distance = Phaser.Math.Between(this.spawnXRange.min, this.spawnXRange.max); 
    const obstacleData = this.obstacleLookup[obstacleNumber];

    let obstacle: Phaser.Physics.Arcade.Image | Phaser.Physics.Arcade.Sprite;
    if(obstacleData.type === 'bird') {
      const h = this.gameHeight - Phaser.Math.Between(20, 70)
      obstacle = this.obstacles.create(distance, h, obstacleData.key) as Phaser.Physics.Arcade.Sprite;
    } else {
      obstacle = this.obstacles  .create(distance, this.gameHeight, obstacleData.key) as Phaser.Physics.Arcade.Image;
    }

    obstacle.setOrigin(0, 1)
      .setImmovable(true)
      .setVelocityX(-this.gameSpeed);
   
  }

  handleCollisions() {
    this.physics.add.collider(this.player, this.obstacles, () => {
      this.handleDeath();
    }, null, this);
  }

  handleDeath() {
    this.isGameRunning = false;
    this.physics.pause();
    this.player.die();
    this.spawnTimer = 0;
    this.cleanupTimer = 0;
    this.gameSpeed = 500;
    this.gameOver.setVisible(true);
  }

  handleRestart() {
    this.physics.resume();
    this.gameOver.setVisible(false);
    this.obstacles.clear(true, true);
    this.player.setVelocityY(0);
    this.anims.resumeAll();
    setTimeout(() => {
      this.player.restart();
      this.isGameRunning = true;  
    }, 250);
    
  }
}