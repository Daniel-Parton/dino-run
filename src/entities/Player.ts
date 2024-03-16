import { GAME_CONFIG } from "@/config";

export class Player extends Phaser.Physics.Arcade.Sprite {

  gameSpeed: number;
  hasRanOnce: boolean = false;
  state: 'idle' | 'down' | 'running' | 'jumping' | 'dead' = 'idle';
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  idleEvent: Phaser.Time.TimerEvent;
  idleBlinks: number = 0;
  inJumpLag: boolean;
  jumpTimer: number = 0;
  jumpVelocity: number = 1550;
  jumpGravityReduction: number = 200;
  gravity: number = 6500;
  constructor(scene: Phaser.Scene, gameSpeed: number) {
    super(scene, 0, scene.scale.height, 'dino-run', 0);
    this.gameSpeed = gameSpeed;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setGravityY(this.gravity);
    this.init();
  }

  init() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.setInteractive({ cursor: 'pointer' });
    this.setOrigin(0, 1)
      .setDepth(1)
      .setGravityY(5000)
      .setOffset(20, 0)
      .setCollideWorldBounds(true);

    this.setRegularHitBox();

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.initAnimations();
    this.idle();

    this.scene.events.on(GAME_CONFIG.events.started, this.run, this);
    this.scene.events.on(GAME_CONFIG.events.died, this.die, this);
    this.scene.events.on(GAME_CONFIG.events.restarted, this.run, this);
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
    this.scene.sound.add('dino-run-start');
    this.scene.sound.add('dino-down');
    this.scene.sound.add('dino-jump');
  }
  
  update() {
    if(this.state === 'dead') {
      return;
    }

    const { space, down } = this.cursors;
    const isSpaceJustDown = space.isDown; 
    const isOnFloor = (this.body as Phaser.Physics.Arcade.Body).onFloor();
    const isDownJustUp = Phaser.Input.Keyboard.JustUp(down!);
    
    const pointer = this.scene.input.activePointer;
    let isClickOrTouchDown = pointer.isDown && !pointer.rightButtonDown();

    const isJumping = isSpaceJustDown || isClickOrTouchDown;
    if(isOnFloor) {

      if(isJumping) {
        this.jump();
      }

      if(this.state !== 'idle' && !this.inJumpLag) {
        if(this.state !== 'down' && down.isDown) {
          this.getDown();
        }
  
        if((isDownJustUp || this.state === 'jumping' && !this.inJumpLag)) {
          this.scene.events.emit(GAME_CONFIG. events.hitGround);
          if(this.hasRanOnce) {
            this.run();
          } else {
            this.idle();
          }
        }
      }
    }

    //This bit allows the player to jump higher if the jump button is held down
    //We allow the jump to be held for 30 frames, then we stop the player from jumping higher
    if(this.state === 'jumping' && isJumping && this.jumpTimer > 0) {
      if (this.jumpTimer > 20) { // player has been holding jump for over 30 frames, it's time to stop him
        this.jumpTimer = 0;
        this.setGravityY(this.gravity);
      } else {
        this.jumpTimer++;
        this.setGravityY(this.body.gravity.y -this.jumpGravityReduction);
      }
    } else {
      this.jumpTimer = 0;
      //When hitting the apex of the jump we want to fall faster
      this.setGravityY(this.body.velocity.y < -500 ? this.gravity + 1000 : this.gravity);
    }
  }

  jump() {
    this.state = 'jumping';
    this.jumpTimer = 1;
    this.scene.sound.play('dino-jump');
    if(this.idleEvent) {
      this.idleEvent.remove();
    }

    this.setVelocityY(-this.jumpVelocity);
    this.play('dino-blink', true);
    this.inJumpLag = true;
    //Just in case someone is spamming down and jump at the same time
    this.scene.time.delayedCall(50, () => {
      this.inJumpLag = false;
      this.setRegularHitBox();
    }, null, this);
  }

  die() {
    this.state = 'dead';
    this.stop();
    this.setTexture('dino-hurt', 0);
    this.scene.sound.play('dino-hurt');
    this.setRegularHitBox();
      this.scene.tweens.add({
        targets: this,
        y: this.scene.scale.height,
        duration: 250,
        ease: 'Linear',
        onComplete: () => {
        },
        callbackScope: this
      });

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
    if(!this.hasRanOnce) {
       this.input.cursor = 'auto';
      this.setInteractive({ cursor: 'default' });
      this.hasRanOnce = true;
      this.scene.sound.play('dino-run-start', { volume: 0.3 });
    }
    this.state = 'running'
    this.jumpTimer = 0;
    this.play('dino-run', true);
    this.setRegularHitBox();
    if(this.getBounds().left < 50) {
      this.initRun();
    }
  }

  getDown() {
    this.state = 'down'
    this.jumpTimer = 0;
    this.play('dino-down', true);
    this.scene.sound.play('dino-down', { volume: 0.5 });
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