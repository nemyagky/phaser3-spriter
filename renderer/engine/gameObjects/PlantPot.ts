import {useScene} from "../../hooks/useScene";
import {Rect} from "../../types/Rect";


interface PlantPotOptions extends Rect {

}

export class PlantPot {

  constructor(options: PlantPotOptions) {
    const scene = useScene();

    const pot = scene.add.rectangle(
      options.x,
      options.y,
      options.width,
      options.height,
      0x8B4513
    );
  }
}