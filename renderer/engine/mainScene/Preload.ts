import {useStore} from "../../hooks/useStore";


export const preload = () => {
  const store = useStore();

  store.animations.preloadAllAnimations();
}
