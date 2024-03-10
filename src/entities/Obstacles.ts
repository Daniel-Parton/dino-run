import { GAME_CONFIG } from "@/config";

type MinMax = { min: number, max: number};

export class Obstacles extends Phaser.Physics.Arcade.Group {

  gameSpeed: number;
  state: 'running' | 'paused' = 'paused';
  obstacleLookup: {type: 'cactus' | 'bird', key: string }[] = [];
  spawnInterval: number = 1500;
  cleanupTimer: number = 0;
  cleanupTimerInterval: number = 100;
  spawnTimer: number = 0;
  spawnXRange: MinMax = { min: 150, max: 300 };

  constructor(scene: Phaser.Scene, gameSpeed: number) {
    super(scene.physics.world, scene);
    scene.add.existing(this);
    scene.physics.add.existing(this as any);
    this.gameSpeed = gameSpeed;
    this.init();
  }

  private init() {

   //Make an array from cactusCount and birdsCount on the GAME_CONFIG object
   for(let i = 1; i <= GAME_CONFIG.cactusCount; i++) {
    this.obstacleLookup.push({ type: 'cactus', key: `cactus-${i}` });
    }

    for(let i = 1; i <= GAME_CONFIG.birdsCount; i++) {
      this.obstacleLookup.push({ type: 'bird', key: `bird-${i}` });
      this.scene.anims.create({
        key: `bird-${i}-fly`,
        frames: this.scene.anims.generateFrameNumbers(`bird-${i}`),
        frameRate: 6,
        repeat: -1
      })
    }

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.scene.events.on(GAME_CONFIG.events.started, this.start, this);
    this.scene.events.on(GAME_CONFIG.events.restarted, this.start, this);
    this.scene.events.on(GAME_CONFIG.events.died, this.pause, this);
    this.scene.events.on(GAME_CONFIG.events.speedUpdated, (gameSpeed: number) => {
      this.gameSpeed = gameSpeed;
      this.getChildren().forEach((o: Phaser.Physics.Arcade.Image) => {
        o.setVelocityX(-this.gameSpeed);
      }, this);
    }, this);
  }

  update(_, delta: number) {
    if(this.state !== 'running') {
      return;
    }

    this.spawnTimer += delta;
    if(this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawn();
    }

    this.cleanupTimer += delta;
    if(this.cleanupTimer >= this.cleanupTimerInterval) {
      this.cleanupTimer = 0;
      this.cleanup();
    }
  }

  start() {
    this.state = 'running';
  }

  pause() {
    this.state = 'paused';
  }

  private spawn() {
    const gameHeight = this.scene.scale.height;
    const gameWidth = this.scene.scale.width;

    const obstacleNumber = Math.floor(Math.random() * this.obstacleLookup.length) ;
    const obstacleData = this.obstacleLookup[obstacleNumber];
    const distance = gameWidth + Phaser.Math.Between(this.spawnXRange.min, this.spawnXRange.max); 

    if(obstacleData.type === 'bird') {
      const isUp = Phaser.Math.Between(0, 1) === 0;
      this.spawnBird(obstacleData.key, distance, gameHeight - (isUp ? 20 : 70));
    } else {
      this.spawnCactus(obstacleData.key, distance, gameHeight);
    }
  }

  private spawnBird(key: string, x: number, y: number) {
    const bird = (this.create(x, y, key) as Phaser.Physics.Arcade.Sprite)
      .setOrigin(0, 1)
      .setImmovable(true)
      .setVelocityX(-this.gameSpeed);
      bird.setBodySize(bird.width - 15, bird.height - 20);
      bird.anims.play(`${key}-fly`, true);
  }

  private spawnCactus(key: string, x: number, y: number) {
    this.create(x, y, key)
      .setOrigin(0, 1)
      .setImmovable(true)
      .setVelocityX(-this.gameSpeed)
  }

  private cleanup() {
    this.getChildren().forEach((o: Phaser.Physics.Arcade.Image) => {
      if(o.getBounds().right < 0) {
        this.remove(o, true, true);
      }
    }, this);
  }
}