
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
    this.load.image('obstacle-1', 'cactuses_1.png');
    this.load.image('obstacle-2', 'cactuses_2.png');
    this.load.image('obstacle-3', 'cactuses_3.png');
    this.load.image('obstacle-4', 'cactuses_4.png');
    this.load.image('obstacle-5', 'cactuses_5.png');
    this.load.image('obstacle-6', 'cactuses_6.png');

    this.load.spritesheet("dino-run", 'dino-run.png', {
      frameWidth: 88,
      frameHeight: 94
    });
  }

  

  create() {
    this.scene.start('Play');
  }

}