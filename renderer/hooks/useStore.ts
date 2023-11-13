import {RootStore} from "../store/RootStore";

export const rootStore = new RootStore();

export const useStore = () => {
  return rootStore;
}