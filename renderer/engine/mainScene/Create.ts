import {GrowingPlant} from "../gameObjects/GrowingPlant";
import {PlantPot} from "../gameObjects/PlantPot";
import {useStore} from "../../hooks/useStore";


export const create = () => {
  const store = useStore();

  store.animations.createAllAnimations();


  const growingPlant = new GrowingPlant({
    animation: {
      x: 1000,
      y: 1500,
      width: 400,
      animationName: "Broccoli",
      defaultCharacter: "broccoli_enemy",
      defaultAnimationName: "look_up"
    }
  });

  growingPlant.playAnimationsQueue([
    {
      animationName: "look_up",
    },
    {
      animationName: "look_around",
      repeat: 2,
    },
    {
      animationName: "look_up_to_inert",
    },
  ])


  const runningPlant = new GrowingPlant({
    animation: {
      x: 2500,
      y: 1500,
      width: 400,
      animationName: "Broccoli",
      defaultCharacter: "broccoli_friendly",
      defaultAnimationName: "idle"
    }
  });

  setTimeout(() => {
    runningPlant.playAnimationsQueue([
      {
        animationName: "walk",
        repeat: 2
      },
      {
        animationName: "run",
        repeat: 3,
      },
      {
        animationName: "die",
      },
    ])
  }, 2000);



  const changingPlant = new GrowingPlant({
    animation: {
      x: 4000,
      y: 1500,
      width: 400,
      animationName: "Broccoli",
      defaultCharacter: "cauliflower_enemy",
      defaultAnimationName: "idle"
    }
  });

  setTimeout(() => {
    changingPlant.changeCharacter("purple_broccoli_enemy");
  }, 3 * 600);


  // const plantPot = new PlantPot({
  //   x: 1010,
  //   y: 1680,
  //   width: 400,
  //   height: 400
  // })
}