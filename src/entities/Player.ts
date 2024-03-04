export class Player extends Phaser.Physics.Arcade.Sprite {

  state: 'idle' | 'down' | 'running' | 'jumping' | 'dead' = 'idle';
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  idleEvent: Phaser.Time.TimerEvent;
  idleBlinks: number = 0;
  inJumpLag: boolean;

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
      .setCollideWorldBounds(true);

    this.setRegularHitBox();

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.initAnimations();
    this.idle();
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

    this.anims.create({
      key: 'dino-down',
      frames: this.anims.generateFrameNumbers('dino-down', { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });
  }

  initSounds() {
    this.scene.sound.add('dino-hurt');
  }
  
  update() {
    if(this.state === 'dead') {
      return;
    }

    const { space, down } = this.cursors;
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space!);
    const isLeftClickDown = this.scene.input.mousePointer.leftButtonDown();
    const isOnFloor = (this.body as Phaser.Physics.Arcade.Body).onFloor();
    const isDownJustDown = Phaser.Input.Keyboard.JustDown(down);
    const isDownJustUp = Phaser.Input.Keyboard.JustUp(down!);

    if(isOnFloor) {
      const isJumping = isSpaceJustDown || isLeftClickDown;

      if(isJumping) {
        this.jump();
      }

      if(this.state !== 'idle' && !this.inJumpLag) {
        if(this.state !== 'down' && down.isDown) {
          this.getDown();
        }
  
        if(isDownJustUp || this.state === 'jumping' && !this.inJumpLag) {
          this.run();
        }
      }
    }
  }

  jump() {
    this.state = 'jumping';
    if(this.idleEvent) {
      this.idleEvent.remove();
    }

    this.setVelocityY(-1600);
    this.play('dino-blink', true);
    this.inJumpLag = true;
    //Just in case someone is spamming down and jump at the same time
    setTimeout(() => {
      this.inJumpLag = false;
      this.setRegularHitBox();
    }, 50);
  }

  die() {
    this.state = 'dead';
    this.setTexture('dino-hurt', 0);
    this.scene.sound.play('dino-hurt');
    this.setRegularHitBox();
  }

  restart() {
    this.initRun();
    this.run();
  }

  initRun() {
    this.scene.tweens.add({
      targets: this,
      x: 50,
      duration: 500,
      ease: 'Linear',
      callbackScope: this,
    });
  }

  run() {
    this.state = 'running'
    this.play('dino-run', true);
    this.setRegularHitBox();
  }

  getDown() {
    this.state = 'down'
    this.play('dino-down', true);
    this.body.setSize(this.body.width, 58);
    this.setOffset(60, 34);
  }

  idle() {
    this.state = 'idle';
    this.setRegularHitBox();

    this.idleEvent = this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        if(this.state === 'idle') {
          if(this.idleBlinks < 5) {
            this.play('dino-idle', true);
            ++this.idleBlinks;
        } else {
            this.idleBlinks = 0;
            this.play('dino-run', true);
          }
        }
      },
      callbackScope: this,
      loop: true
    });

  }

  setRegularHitBox() {
    this.body.setSize(44, 92);
    this.body.setOffset(20, 0);
  }
}