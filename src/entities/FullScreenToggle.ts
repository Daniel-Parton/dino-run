type Options = {
  x: number;
  y: number;
};

export class FullScreenToggle extends Phaser.GameObjects.Image {
  
  baseScale: number = 0.4;
  constructor(scene: Phaser.Scene, { x, y }: Options) {
    super(scene, x, y, 'full-screen');
    scene.add.existing(this);
    this.init();
  }

  init() {
    this
    .setInteractive({ cursor: 'pointer'})
    .setScale(this.baseScale)
    .on('pointerover', () => {
      this.scene.tweens.add({
        scale: this.baseScale * 1.1,
        targets: this,
        duration: 250,
        ease: Phaser.Math.Easing.Sine.InOut,
      });
    } , this)
    .on('pointerout', () => {
      this.scene.tweens.add({
        scale: this.baseScale,
        targets: this,
        duration: 250,
        ease: Phaser.Math.Easing.Sine.InOut,
      });
    }, this)
      .on('pointerdown', (_, __, ___, event: Phaser.Input.Pointer['event']) => {
        this.scene.scale.toggleFullscreen();
        event.stopPropagation();
      }, this);
  }
}