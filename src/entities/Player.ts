export class Player extends Phaser.Physics.Arcade.Sprite {

  hasStarted: boolean;
  hasJumpedOnce: boolean;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  idleEvent: Phaser.Time.TimerEvent;
  idleBlinks: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'dino-run', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.init();
  }

  init() {

    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.setOrigin(0, 1)
      .setGravityY(5000)
      .setCollideWorldBounds(true)
      .setBodySize(44, 92);

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);

    this.initAnimations();
    this.initIdleState();
  }

  initAnimations() {

    this.anims.create({
      key: 'dino-idle',
      frames: this.anims.generateFrameNumbers('dino-run', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: 0
    });

    this.anims.create({
      key: 'dino-run',
      frames: this.anims.generateFrameNumbers('dino-run', { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'dino-blink',
      frames: this.anims.generateFrameNumbers('dino-run', { start: 0, end: 1 }),
      frameRate: 5,
      repeat: -1
    });
  }

  initIdleState() {
    this.idleEvent = this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        if(this.idleBlinks < 5) {
          this.animateIdle();
          ++this.idleBlinks;
      } else {
          this.idleBlinks = 0;
          this.animateRun();
        }
      },
      callbackScope: this,
      loop: true
    });
  }
  
  update() {
    const { space } = this.cursors;
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space!);
    const isLeftClickDown = this.scene.input.mousePointer.leftButtonDown();
    const isOnFloor = (this.body as Phaser.Physics.Arcade.Body).onFloor();

    if((isSpaceJustDown || isLeftClickDown) && isOnFloor) {
      this.jump();
    }

    this.handleJump();
  }

  handleJump() {
    if(this.hasJumpedOnce) {
      if(this.body.deltaAbsY() > 1.39) {
        this.animateBlink();
      } else {
        if(this.hasStarted) {
          this.animateRun();
        } else {
          this.anims.stop();
          this.setTexture('dino-run', 0);
        }
      }
    }
  }

  jump() {
    this.hasJumpedOnce = true;
    this.setVelocityY(-1600);
  }

  run() {
    this.hasStarted = true;
    this.scene.tweens.add({
      targets: this,
      x: 50,
      duration: 500,
      ease: 'Linear',
      callbackScope: this,
    });
    this.animateRun();
  }

  animateRun() {
    this.play('dino-run', true);
  }

  animateBlink() {
    this.play('dino-blink', true);
  }

  animateIdle() {
    this.play('dino-idle', true);
  }
}