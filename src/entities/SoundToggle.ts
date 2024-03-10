type Options = {
  x: number;
  y: number;
};

export class SoundToggle extends Phaser.GameObjects.Sprite {
  
  baseScale: number = 0.4;
  constructor(scene: Phaser.Scene, { x, y }: Options) {
    super(scene, x, y, scene.sound.mute ? 'sound-off' : 'sound-on', 0);
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
        if(this.scene.sound.mute) {
          this.setTexture('sound-on');
          this.scene.sound.setMute(false);
        } else {
          this.setTexture('sound-off');
          this.scene.sound.setMute(true);
        }
        event.stopPropagation();
      }, this);
  }
}