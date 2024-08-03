import { App } from "./app/app";
import cUserAgent from "./app/userAgent";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
  document.querySelector("#gfx-main")
);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const app = new App(canvas);
cUserAgent.init(canvas).then(() => app.init().then(() => app.run()));
