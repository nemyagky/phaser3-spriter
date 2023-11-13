import {SpriterContainer} from "../spriterPlayerLib";
import {useScene} from "../../hooks/useScene";
import {useStore} from "../../hooks/useStore";
import {RectScaledByWidth, IRectScaledByWidth} from "../../types/Rect";


export interface SpriterAnimationOptions extends IRectScaledByWidth {
  animationName: string;
  defaultCharacter: string;
  defaultAnimationName: string;
}

interface PlayAnimationOptions {
  animationName: string;
  loop?: boolean;
  repeat?: number;
}


export class SpriterAnimation extends RectScaledByWidth {

  private animationContainer: SpriterContainer;
  private readonly animationName: string;

  constructor(options: SpriterAnimationOptions) {
    super(options.x, options.y, options.width);

    this.animationName = options.animationName;

    this.createAnimationContainer(options);
  }

  private createAnimationContainer(options: SpriterAnimationOptions) {
    const store = useStore();
    const scene = useScene();

    const cachedAnimation = store.animations.loadedAnimations.get(options.animationName);

    this.animationContainer = new SpriterContainer({
      scene,
      animation: cachedAnimation,
      atlasKey: `${options.animationName}Atlas`,
      defaultAnimationName: options.defaultAnimationName,
      defaultCharacter: options.defaultCharacter,
    });

    this.animationContainer.setPosition(options.x, options.y);
    this.animationContainer.scale = 0.6;


    scene.add.existing(this.animationContainer);
    store.animations.saveAnimationContainer(this.animationContainer);
  }


  public playAnimation({animationName, loop = false}: PlayAnimationOptions): Promise<void> {
    return new Promise((resolve) => {

      const finishAnimation = () => {
        // TODO check if actually removed
        this.animationContainer.onFinish.removeAllListeners();
        this.animationContainer.onLoop.removeAllListeners();

        resolve();
      }

      this.animationContainer.playAnimation({
        animationName,
        loop,
      });

      this.animationContainer.onLoop.once("ON_LOOP", () => {
        finishAnimation();
      });

      this.animationContainer.onFinish.once("ON_FINISH", () => {
        finishAnimation();
      });
    })
  }

  public async playAnimationsQueue(animations: PlayAnimationOptions[]) {
    for (const animation of animations) {
      await this.playAnimation(animation);

      if (animation.repeat) {
        for (let i = 1; i < animation.repeat; i++) {
          await this.playAnimation(animation);
        }
      }
    }
  }

  public changeCharacter(characterName: string) {
    const store = useStore();
    const cachedAnimation = store.animations.loadedAnimations.get(this.animationName);

    this.animationContainer.changeEntity(cachedAnimation, characterName);
  }
}
