import * as Phaser from 'phaser';
import {preload} from "./Preload";
import {create} from "./Create";
import {update} from "./Update";
import {saveScene} from "../../hooks/useScene";


export class MainScene extends Phaser.Scene {
  constructor() {
    super({key: 'MainScene'});

    saveScene(this);
  }

  preload() {
    preload();
  }

  create() {
    create();
  }

  update() {
    update();
  }
}

export interface IMainScene extends MainScene {
}
