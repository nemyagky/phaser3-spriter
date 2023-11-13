import * as React from "react";
import * as ReactDOM from "react-dom/client";
import Main from "./Main";
import "../styles/global.scss";
import {initGame} from "../engine/Game";

initGame();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Main/>
  </React.StrictMode>
);
