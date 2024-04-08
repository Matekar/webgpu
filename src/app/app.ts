import { Renderer } from "../view/renderer";
import { Scene } from "../model/scene";
import { RenderMode } from "../model/definitions";

export class App {
  canvas: HTMLCanvasElement;
  renderer: Renderer;
  scene: Scene;

  keyLabel: HTMLElement;
  mouseXLabel: HTMLElement;
  mouseYLabel: HTMLElement;
  cameraPositionLabel: HTMLElement;

  moveMap: Map<String, Boolean>;
  acceleration: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.scene = new Scene();

    this.keyLabel = <HTMLElement>document.querySelector("#key_label");
    this.mouseXLabel = <HTMLElement>document.querySelector("#mouse_x_label");
    this.mouseYLabel = <HTMLElement>document.querySelector("#mouse_y_label");
    this.cameraPositionLabel = <HTMLElement>(
      document.querySelector("#camera_position_label")
    );

    document.addEventListener("keydown", (event) => this._handleKeydown(event));
    document.addEventListener("keyup", (event) => this._handleKeyup(event));

    this.moveMap = new Map();

    this.acceleration = 3;

    this.canvas.addEventListener("click", () => {
      this.canvas.requestPointerLock();
      // this.canvas.requestFullscreen();
    });
    this.canvas.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement === this.canvas)
        this._handleMousemove(event);
    });
  }

  async init() {
    await this.renderer.init();
  }

  run = () => {
    let running: boolean = true;
    let doAccelerate = this.moveMap.get("ShiftLeft");

    this.scene.update();
    this.scene.movePlayer(
      (this.moveMap.get("KeyW")
        ? 0.1 * (doAccelerate ? this.acceleration : 1)
        : 0) +
        (this.moveMap.get("KeyS")
          ? -0.1 * (doAccelerate ? this.acceleration : 1)
          : 0),
      (this.moveMap.get("KeyD")
        ? 0.1 * (doAccelerate ? this.acceleration : 1)
        : 0) +
        (this.moveMap.get("KeyA")
          ? -0.1 * (doAccelerate ? this.acceleration : 1)
          : 0),
      (this.moveMap.get("Space")
        ? 0.1 * (doAccelerate ? this.acceleration : 1)
        : 0) +
        (this.moveMap.get("ControlLeft")
          ? -0.1 * (doAccelerate ? this.acceleration : 1)
          : 0)
    );

    this.renderer.render(this.scene.getRenderables());

    this._printDebugInfo();

    if (running) {
      requestAnimationFrame(this.run);
    }
  };

  _handleKeydown(event: KeyboardEvent) {
    if (event.code === "KeyR") {
      this.scene.resetPlayer();
      return;
    }

    if (event.code.startsWith("Digit")) {
      if (event.code === "Digit1")
        this.renderer.switchPipeline(RenderMode.UNLIT);
      else if (event.code === "Digit2")
        this.renderer.switchPipeline(RenderMode.WIREFRAME);
    }

    this.moveMap.set(event.code, true);
  }

  _handleKeyup(event: KeyboardEvent) {
    this.moveMap.set(event.code, false);
  }

  _handleMousemove(event: MouseEvent) {
    // FIXME: move to _printDebugInfo
    this.mouseXLabel.innerText =
      "Mouse X acceleration: " + event.movementX.toString();
    this.mouseYLabel.innerText =
      "Mouse Y acceleration: " + event.movementY.toString();

    this.scene.spinPlayer(event.movementX * 0.2, event.movementY * 0.2);
  }

  _printDebugInfo = () => {
    this.keyLabel.innerText = "Current keys: [";
    this.moveMap.forEach(
      (v, k) => (this.keyLabel.innerText += v ? k + " " : "")
    );
    this.keyLabel.innerText += "]";

    this.cameraPositionLabel.innerHTML =
      "Camera position: " +
      Math.floor((this.scene.player.position[0] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((this.scene.player.position[1] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((this.scene.player.position[2] + Number.EPSILON) * 100) / 100;
  };
}
