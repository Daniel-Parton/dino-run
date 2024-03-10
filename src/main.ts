import './style.css';
import Phaser from "phaser";
import { Boot } from "./scenes/Boot";
import { Preload } from "./scenes/Preload";
import { Play } from "./scenes/Play";

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
  } as any,
  scene: [
    Boot,
    Preload,
    Play
  ]
};

new Phaser.Game(config);