import { GAME_CONFIG } from "@/config";
import { ImageButton } from "./ImageButton";

export class GameOver extends Phaser.GameObjects.Container {

  gameOverText: Phaser.GameObjects.Image;
  restartButton: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, onRestart: () => void) {
    const { width, height } = scene.scale;
    super(scene, width /2, height / 2);
    this.setVisible(false);
    scene.add.existing(this);
    scene.physics.add.existing(this as any);
    this.init(onRestart);
  }

  private init(onRestart: () => void) {
    const spacing = 30;
    this.gameOverText = this.scene.add.image(0, -spacing, 'game-over')
      .setOrigin(0.5);

  const self = this;
  this.restartButton = new ImageButton(this.scene, { 
    x: 0, 
    y: spacing, 
    key: 'restart', 
    onClick: () => {
      onRestart();
      self.setVisible(false);
    },
  })
    .setOrigin(0.5);

    this.add([this.gameOverText, this.restartButton]);

    this.scene.events.on(GAME_CONFIG.events.died, () => this.setVisible(true), this);
    this.scene.events.on(GAME_CONFIG.events.restarted, () => this.setVisible(false), this);
  }
}