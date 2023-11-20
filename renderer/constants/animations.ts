export const ANIMATIONS_PATH = '/animations';


export interface IAnimationFile {
  animationName: string;
  folderName: string;
  fileName: string;
}


export const ALL_ANIMATIONS: IAnimationFile[] = [
  {
    animationName: "Broccoli",
    folderName: "broccoli",
    fileName: "broccoli"
  }
]





// Variable for test
export const entities = [
  {
    name: "broccoli_enemy",
    baseAnimation: "look_up",
  },
  {
    name: "broccoli_enemy",
    baseAnimation: "walk",
    startFrom: 500
  },
  {
    name: "cauliflower_friendly",
    baseAnimation: "run",
  },
  {
    name: "cauliflower_enemy",
    baseAnimation: "look_up",
  },
  {
    name: "purple_broccoli_friendly",
    baseAnimation: "idle",
  },
  {
    name: "purple_broccoli_enemy",
    baseAnimation: "die",
  },
  {
    name: "broccoli_friendly",
    baseAnimation: "run",
  }
];