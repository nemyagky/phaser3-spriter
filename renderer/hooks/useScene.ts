import {IMainScene} from "../engine/mainScene/MainScene";


let globalScene: IMainScene;

export const saveScene = (mainScene: IMainScene) => {
  globalScene = mainScene;
}


export const useScene = () => {
  return globalScene;
}
