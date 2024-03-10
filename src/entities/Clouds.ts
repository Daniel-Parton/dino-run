import { GAME_CONFIG } from "@/config";

export class Clouds extends Phaser.Physics.Arcade.Group {

  gameSpeed: number;
  state: 'running' | 'paused' = 'paused';
  cleanupTimer: number = 0;
  cleanupTimerInterval: number = 10;

  constructor(scene: Phaser.Scene, gameSpeed: number) {
    const gameWidth = scene.scale.width;
    super(scene.physics.world, scene, [
      scene.add.image(gameWidth / 2, 170, 'cloud'),
      scene.add.image(gameWidth - 80, 80, 'cloud'),
      scene.add.image(gameWidth / 1.3, 100, 'cloud'),
    ]);
    this.gameSpeed = gameSpeed;
    this.setVisible(false);
    scene.add.existing(this);
    scene.physics.add.existing(this as any);
    this.init();
  }

  private init() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);

    this.scene.events.on(GAME_CONFIG.events.started, this.start, this);
    this.scene.events.on(GAME_CONFIG.events.speedUpdated, (speed: number) => {
      this.gameSpeed = speed;
      this.setVelocityX(-this.gameSpeed / 20);
    }, this);
  }

  update(_, delta: number) {
    if(this.state !== 'running') {
      return;
    }

    this.cleanupTimer += delta;
    if(this.cleanupTimer >= this.cleanupTimerInterval) {
      this.cleanupTimer = 0;
      this.cleanup();
    }
  }

  start() {
    this.state = 'running';
    this.setVisible(true);
    this.setVelocityX(-this.gameSpeed / 20);
  }

  private cleanup() {
    this.getChildren().forEach((o: Phaser.Physics.Arcade.Image) => {
      if(o.getBounds().right < 0) {
        o.setX(this.scene.scale.width + o.width);
      }
    }, this);
  }
}