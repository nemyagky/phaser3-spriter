import {SpriterAnimation, SpriterAnimationOptions} from "./SpriterAnimation";


interface GrowingPlantOptions {
  animation: SpriterAnimationOptions,
}


export class GrowingPlant extends SpriterAnimation {

  constructor(options: GrowingPlantOptions) {
    super(options.animation);

  }
}