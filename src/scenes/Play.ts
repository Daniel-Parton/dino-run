import { GAME_CONFIG } from '@/config';
import { Clouds } from '@/entities/Clouds';
import { GameOver } from '@/entities/GameOver';
import { Obstacles } from '@/entities/Obstacles';
import { Player } from '@/entities/Player';
import { Score } from '@/entities/Score';
import { SoundToggle } from '@/entities/SoundToggle';

export class Play extends Phaser.Scene {

  get gameHeight() {
    return this.scale.height;
  }

  isGameRunning: boolean = false;
  gameSpeedModifier: number = 1;
  gameSpeedModifierIncrease: number = 0.1;
  gameSpeedBase: number = 750;
  backgroundMusic: Phaser.Sound.BaseSound;
  backgroundLoseMusic: Phaser.Sound.BaseSound;
  soundToggleButton: SoundToggle;

  get gameSpeed() {
    return this.gameSpeedBase * this.gameSpeedModifier;
  }

  ground: Phaser.GameObjects.TileSprite;
  clouds: Clouds;
  startTrigger: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  gameOver: GameOver;
  score: Score;
  player: Player;
  obstacles: Obstacles;

  constructor() {
    super('Play');
  }

  create() {
    this.initEnvironment();
    this.initPlayer();
    this.initStartTrigger();
    this.handleCollisions();

    this.events.on(GAME_CONFIG.events.scoreTierUpdated, this.increaseSpeed, this);
  }

  update(_, delta: number): void {
    if(!this.isGameRunning) {
      return;
    }
    
    this.ground.tilePositionX += this.gameSpeed * delta / 1000;
  }

  initEnvironment() {
    this.backgroundMusic = this.sound.add('background', { loop: true, volume: 0.05 });
    this.backgroundLoseMusic = this.sound.add('background-lose', { loop: true, volume: 0.05 });
    this.backgroundMusic.play();

    this.ground = this.add.tileSprite(0, this.scale.height, 88, 26, 'ground')
      .setOrigin(0, 1);

    this.clouds = new Clouds(this, this.gameSpeed);
    this.obstacles = new Obstacles(this, this.gameSpeed);
    this.gameOver = new GameOver(this, this.handleRestart.bind(this) );
    this.score = new Score(this);
    this.soundToggleButton = new SoundToggle(this, { x: 2, y: 2 })
      .setOrigin(0, 0);
  }

  initPlayer() {
    this.player = new Player(this, this.gameSpeed);
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
      //This yeets the trigger out of the way so we don't need to worry about it
      this.startTrigger.body.reset(9999, 9999);
      this.start();
    });
  }

  start() {
    //Grow the floor and then start running!
    this.tweens.add({
      targets: this.ground,
      width: 1000,
      duration: 500,
      ease: 'Linear',
      callbackScope: this,
      onComplete: () => {
        this.isGameRunning = true;
        this.events.emit(GAME_CONFIG.events.started);
      },
    });
  }

  handleCollisions() {
    this.physics.add.collider(this.player, this.obstacles, (_, o: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
      if(this.isGameRunning) {
        this.handleDeath(o);
        this.events.emit(GAME_CONFIG.events.died);
      }
    }, null, this);
  }

  handleDeath(obstacle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    this.isGameRunning = false;
    this.backgroundMusic.stop();
    this.backgroundLoseMusic.play();
    this.time.delayedCall(50, () => {
      this.physics.pause();
    }, null, this);
    if(obstacle.texture.key.includes('bird')) {
      this.tweens.add({
        targets: obstacle,
        x: -100,
        duration: 500,
        ease: 'Linear',
      });
    }
  }

  handleRestart() {
    this.physics.resume();
    this.gameOver.setVisible(false);
    this.obstacles.clear(true, true);
    this.player.setVelocityY(0);
    this.anims.resumeAll();
    this.resetSpeed();
    this.backgroundLoseMusic.stop();
    this.backgroundMusic.play();
    this.time.delayedCall(250, () => {
      this.events.emit(GAME_CONFIG.events.restarted);
      this.isGameRunning = true;  
    }, null, this);
  }

  resetSpeed() {
    this.gameSpeedModifier = 1;
    this.events.emit(GAME_CONFIG.events.speedUpdated, this.gameSpeed);
  }

  increaseSpeed() {
    this.gameSpeedModifier += this.gameSpeedModifierIncrease;
    this.events.emit(GAME_CONFIG.events.speedUpdated, this.gameSpeed);
  }
}