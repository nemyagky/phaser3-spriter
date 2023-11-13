import Phaser from "phaser";
import {MainScene} from "./mainScene/MainScene";

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#125555',
  scene: MainScene,
  // Zoom by default, check styles.scss
  width: window.innerWidth * 4,
  height: window.innerHeight * 4,
};


export const initGame = () => {
  new Phaser.Game(config);
}

