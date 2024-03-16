import { GAME_CONFIG } from "@/config";
import { LocalStorageHelper } from "@/utils/LocalStorageHelper";

export class Score extends Phaser.GameObjects.Container {

  bestScoreKey = 'bestScore';
  state: 'calculating' | 'stopped' = 'stopped';

  currentText: Phaser.GameObjects.Text;
  bestText: Phaser.GameObjects.Text;
  bestTextPrefix: Phaser.GameObjects.Text;

  best: number = 0;
  current: number = 0;

  interval: number = 25;
  delta: number = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.setVisible(false);
    scene.add.existing(this);
    scene.physics.add.existing(this as any);
    this.init();
  }

  private init() {
    this.scene.sound.add('score');
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.best = LocalStorageHelper.getInt(this.bestScoreKey);
    const gameWidth = this.scene.scale.width;
    this.currentText = this.scene.add.text(gameWidth - 5, 0, '00000', {
      fontSize: 25,
      fontFamily: 'Arial',
      color: '#535353',
    }).setOrigin(1, 0);

    const spacing = 15;
    this.bestText = this.scene.add.text(gameWidth - 5 - this.currentText.width - spacing, 0, this.best.toString().padStart(5, '0'), {
      fontSize: 25,
      fontFamily: 'Arial',
      color: '#535353',
    }).setOrigin(1, 0);

    this.bestTextPrefix = this.scene.add.text(gameWidth - this.currentText.width - this.bestText.width - spacing - (spacing / 2), 0, 'HI', {
      fontSize: 25,
      fontFamily: 'Arial',
      color: '#535353',
    }).setOrigin(1, 0);

    
    this.add([this.currentText, this.bestTextPrefix, this.bestText]);

    this.scene.events.on(GAME_CONFIG.events.started, this.start, this);
    this.scene.events.on(GAME_CONFIG.events.restarted, this.start, this);
    this.scene.events.on(GAME_CONFIG.events.died, this.stop, this);

    this.scene.events.on(GAME_CONFIG.events.speedUpdated, () => {
      this.scene.tweens.add({
        targets: this.currentText,
        duration: 100,
        scale: 1.1,
        repeat: 2,
        alpha: 0,
        yoyo: true
      });
    }, this);
  }

  update(_, delta: number) {
    if(this.state !== 'calculating') {
      return;
    }

    this.delta += delta;
    if(this.delta >= this.interval) {
      this.delta = 0;
      this.setScore(this.current + 1);
    }
  }

  start() {
    this.state = 'calculating';
    this.setScore(0);
    if(this.best > 0) {
      this.bestText.setVisible(true);
      this.bestTextPrefix.setVisible(true);
    }
    this.setVisible(true);
  }

  stop() {
    this.state = 'stopped';
    this.setVisible(true);
  }

  private setScore(value: number) {
    this.current = value;
    this.currentText.text = this.current.toString().padStart(5, '0');
    if(this.current > 0 && this.current % 100 === 0) {
      this.scene.sound.play('score');
      this.scene.events.emit(GAME_CONFIG.events.scoreTierUpdated, this.current);
    }
    if(this.current > this.best) {
      this.best = this.current;
      this.bestText.text = this.best.toString().padStart(5, '0');
      LocalStorageHelper.set(this.bestScoreKey, this.best);
    }
  }
}