import './style.css';
import Phaser from "phaser";
import { Boot } from "./scenes/Boot";
import { Preload } from "./scenes/Preload";
import { Play } from "./scenes/Play";
import { isMobileDevice, tryResumeGameSound } from './utils/DeviceHelper';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  height: 340,
  width: 1000,
  min: {
    width: 340,
    height: 0
  },
  parent: 'game-container',
  pixelArt: true,
  transparent: true,
  autoFocus: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'game-container'
  },
  scene: [
    Boot,
    Preload,
    Play
  ]
};

const game = new Phaser.Game(config);

document.body.addEventListener('click', () => tryResumeGameSound(game));
document.body.addEventListener('touchend', () => {
  if(isMobileDevice()) {
    game.scale.startFullscreen();
  }
  tryResumeGameSound(game);
});


game.scale.on('enterfullscreen', () => {
  game.scale.refresh();
  const orientation = screen.orientation as any;
  if(isMobileDevice()) {
    orientation.lock?.('landscape').catch(function(error) {
      console.error("Orientation lock error: " + error);
    });
  }
})