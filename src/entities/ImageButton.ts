type Options = {
  x: number;
  y: number;
  key: string;
  onClick: () => void;
  onClickThis?: any;
};

export class ImageButton extends Phaser.GameObjects.Image {
  onClick: () => void;
  onClickThis?: any
  
  constructor(scene: Phaser.Scene, { key, x, y, onClick, onClickThis}: Options) {
    super(scene, x, y, key, 0);
    scene.add.existing(this);
    this.init({ onClick, onClickThis });
  }

  init({ onClick, onClickThis }: Pick<Options, 'onClick' | 'onClickThis'>) {
    
    this.setInteractive({ cursor: 'pointer'})
    .on('pointerover', () => {
      this.scene.tweens.add({
        scale: 1.25,
        targets: this,
        duration: 250,
        ease: Phaser.Math.Easing.Sine.InOut,
      });
    } , this)
    .on('pointerout', () => {
      this.scene.tweens.add({
        scale: 1,
        targets: this,
        duration: 250,
        ease: Phaser.Math.Easing.Sine.InOut,
      });
    }, this)
      .on('pointerdown', onClick, onClickThis);
  }
}