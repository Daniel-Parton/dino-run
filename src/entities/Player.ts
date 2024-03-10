import { GAME_CONFIG } from "@/config";

export class Player extends Phaser.Physics.Arcade.Sprite {

  gameSpeed: number;
  hasRanOnce: boolean = false;
  state: 'idle' | 'down' | 'running' | 'jumping' | 'dead' = 'idle';
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  idleHitBox: Phaser.Geom.Rectangle;
  idleEvent: Phaser.Time.TimerEvent;
  idleBlinks: number = 0;
  inJumpLag: boolean;

  constructor(scene: Phaser.Scene, gameSpeed: number) {
    super(scene, 0, scene.scale.height, 'dino-run', 0);
    this.gameSpeed = gameSpeed;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.init();
  }

  init() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.idleHitBox = new Phaser.Geom.Rectangle(0, 50, 100, this.scene.scale.height - 50);
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
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space!);
    const isOnFloor = (this.body as Phaser.Physics.Arcade.Body).onFloor();
    const isDownJustUp = Phaser.Input.Keyboard.JustUp(down!);
    
    const pointer =this.scene.input.activePointer;
    let isClickOrTouchDown = pointer.isDown && !pointer.rightButtonDown();

    //When in idle state we want the user to click on the dino to start the game
    //On mobile the hit-box is a little small so the idle hit-box makes it a bit easier
    if(isClickOrTouchDown && this.state === 'idle') {
      if(!this.idleHitBox.contains(pointer.x, pointer.y)) {
        isClickOrTouchDown = false;
      }
    }

    if(isOnFloor) {
      const isJumping = isSpaceJustDown || isClickOrTouchDown;

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
    this.scene.sound.play('dino-jump');
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
    this.play('dino-run', true);
    this.setRegularHitBox();
    if(this.getBounds().left < 50) {
      this.initRun();
    }
  }

  getDown() {
    this.state = 'down'
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