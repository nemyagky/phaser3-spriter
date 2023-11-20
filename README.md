# Render your animations created in Spriter using Phaser3 and TypeScript

Demo available here: https://phaser3-spriter.vercel.app/ (animation size is 9MB, wait a second)


There's bones support, I've implemented support for multiple characters, playing animations queue, etc. In general, it should be able to render animations of any complexity. You can check demo, I've added one complex animation there

This repository is a wrapper for https://github.com/SBCGames/Spriter-Player-for-Phaser, so please star it as well :) The original repo is for Phaser2, I've made changes to make it work with Phaser3. My repo won't support Phaser2!

I've also implemented a SpriterAnimation class, which makes it very easy to work with animations, so please check it as well. Actually, this repo - my playground for experiments with Phaser3 Spriter Animations, so you can also find a good architecture for your game here.

Please note, that demo contains one paid animation from https://gamedeveloperstudio.com. I got permission to share it here, and you can use it to test the runtime and for personal use. Please check the official site if you wish to use the sprite commercially, they have a lot of cool animations for your games.


# How to use
You can just copy-paste spriterPlayerLib in your project to make it work for you. It contains files from original repo + my updates. Fell free to update any files in spriterPlayerLib folder for your needs.


## Here's how do I use it in my project:

1. Define ALL_ANIMATIONS const
```javascript
export const ALL_ANIMATIONS: IAnimationFile[] = [
  {
    animationName: "Broccoli",
    folderName: "broccoli",
    fileName: "broccoli"
  }
]
```

2. In your preload function:

```javascript
const store = useStore();

store.animations.preloadAllAnimations();
```

**preloadAllAnimations under the hood:**

```javascript
private preloadAnimation(animationFile: IAnimationFile) {
    const scene = useScene();

    scene.load.setPath(`${ANIMATIONS_PATH}${animationFile.folderName}`);

    scene.load.atlas(`${animationFile.animationName}Atlas`, `${animationFile.fileName}.png`, `${animationFile.fileName}.json`);
    scene.load.xml(`${animationFile.animationName}Xml`, `${animationFile.fileName}.xml`);
}
```

3. In your create function:

```javascript
const store = useStore();

store.animations.createAllAnimations();

const plant = new GrowingPlant({
    animation: {
        x: 1500,
        y: 1500,
        width: 400,
        animationName: "Broccoli",
        defaultCharacter: "broccoli_enemy",
        defaultAnimationName: "idle"
    }
});

plant.changeCharacter("broccoli_friendly");
plant.playAnimationsQueue([
    {
        animationName: "idle",
    },
    {
        animationName: "attack",
        repeat: 2
    },
    {
        animationName: "die",
        loop: false,
    }
])
```
