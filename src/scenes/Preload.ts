import { GAME_CONFIG } from "@/config";

export class Preload extends Phaser.Scene {

  constructor() {
    super('Preload');
  }

  init() {
    this.add.tileSprite(0, this.scale.height, 1000, 26, 'ground')
      .setOrigin(0, 1);
  }

  preload() {
    this.load.setPath('./assets');
   
    this.load.image('dino-idle', 'dino-idle-2.png');

    this.load.image('dino-hurt', 'dino-hurt.png');
    this.load.audio('dino-hurt', 'dino-hurt.mp3');
    
    this.load.spritesheet("dino-down", 'dino-down-2.png', {
      frameWidth: 118,
      frameHeight: 94
    });

    this.load.spritesheet("dino-run", 'dino-run.png', {
      frameWidth: 88,
      frameHeight: 94
    });

    this.load.image('restart', 'restart.png');
    this.load.image('game-over', 'game-over.png');

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
  }

  create() {
    this.scene.start('Play');
  }

}