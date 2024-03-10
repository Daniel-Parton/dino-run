import { GAME_CONFIG } from "@/config";

export class Preload extends Phaser.Scene {

  constructor() {
    super('Preload');
  }

  preload() {
    this.load.setPath('./assets');
   
    //Player
    this.load.image('dino-idle', 'dino-idle-2.png');

    this.load.image('dino-hurt', 'dino-hurt.png');
    this.load.audio('dino-hurt', 'dino-hurt.mp3');

    this.load.audio('dino-jump', 'dino-jump.mp3');
    this.load.audio('dino-run-start', 'dino-run-start.mp3');
    
    this.load.audio('dino-down', 'dino-down.mp3');
    this.load.spritesheet("dino-down", 'dino-down-2.png', {
      frameWidth: 118,
      frameHeight: 94
    });

    this.load.spritesheet("dino-run", 'dino-run.png', {
      frameWidth: 88,
      frameHeight: 94
    });
    
    //Obstacles
    for(let i = 0; i < GAME_CONFIG.cactusCount; i++) {
      const number = i + 1;
      this.load.image(`cactus-${number}`, `cactuses_${number}.png`);
    }

    for(let i = 0; i < GAME_CONFIG.birdsCount; i++) {
      const number = i + 1;
      this.load.spritesheet(`bird-${number}`, `enemy-bird-${number}.png`, {
        frameWidth: 92,
        frameHeight: 77
      });
    }

    //Game over popover
    this.load.image('restart', 'restart.png');
    this.load.image('game-over', 'game-over.png');

    //Sound
    this.load.image('sound-on', 'sound-on.png');
    this.load.image('sound-off', 'sound-off.png');

    //Score
    this.load.audio('score', 'score.mp3');

    //Background
    this.load.audio('background-lose', 'background-lose.mp3');
    this.load.audio('background', 'background.mp3');

  }

  create() {
    this.scene.start('Play');
  }

}