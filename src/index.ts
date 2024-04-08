import { App } from "./app/app";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
  document.querySelector("#gfx-main")
);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const app = new App(canvas);
app.init().then(() => app.run());
