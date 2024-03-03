export class Boot extends Phaser.Scene {

  constructor() {
    super('Boot');
  }

  preload () {
    this.load.setPath('./assets');
    this.load.image('ground', 'ground.png');
  }

  create() {
    this.scene.start('Preload');
  }
}