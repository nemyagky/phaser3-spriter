import {ALL_ANIMATIONS, ANIMATIONS_PATH, IAnimationFile} from "../constants/animations";
import {useScene} from "../hooks/useScene";
import * as Spriter from "../engine/spriterPlayerLib";


export class Animations {
  public loadedAnimations: Map<string, Spriter.Spriter> = new Map();
  public animationContainers: Spriter.SpriterContainer[] = [];


  public saveAnimationContainer(animationContainer: Spriter.SpriterContainer) {
    this.animationContainers.push(animationContainer);
  }


  private preloadAnimation(animationFile: IAnimationFile) {
    const scene = useScene();

    scene.load.setPath(`${ANIMATIONS_PATH}/${animationFile.folderName}`);

    scene.load.atlas(`${animationFile.animationName}Atlas`, `${animationFile.fileName}.png`, `${animationFile.fileName}.json`);
    scene.load.xml(`${animationFile.animationName}Xml`, `${animationFile.fileName}.xml`);
  }

  public preloadAllAnimations() {
    ALL_ANIMATIONS.forEach((animationFile: IAnimationFile) => {
      this.preloadAnimation(animationFile);
    });
  }


  private createAnimation(animationFile: IAnimationFile) {
    const scene = useScene();

    const spriterLoader = new Spriter.Loader();
    const cachedXml = scene.cache.xml.get(`${animationFile.animationName}Xml`);

    const spriterFile = new Spriter.SpriterXml(cachedXml, {
      imageNameType: Spriter.eImageNameType.FULL_PATH_NO_EXTENSION
    });
    const spriterData = spriterLoader.load(spriterFile);

    this.loadedAnimations.set(animationFile.animationName, spriterData);
  }

  public createAllAnimations() {
    ALL_ANIMATIONS.forEach((animationFile: IAnimationFile) => {
      this.createAnimation(animationFile);
    });
  }
}