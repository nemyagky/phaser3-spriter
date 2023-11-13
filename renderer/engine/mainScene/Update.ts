import {useScene} from "../../hooks/useScene";
import {useStore} from "../../hooks/useStore";

let i = 0
const logFps = (fps: number) => {
  if (i % 60 === 0) {
    console.log(Math.floor(fps));
  }
  i++
}


export const update = () => {
  // const scene = useScene();
  const store = useStore();

  store.animations.animationContainers.forEach((animationContainer) => {
    animationContainer.updateAnimation();
  })

  // logFps(scene.game.loop.actualFps);
}
