import { Renderer } from "../view/renderer";
import { Scene } from "../model/scene";
import { RenderMode } from "../interfaces/enums";
import {
  rad2deg,
  rayIntersectionTest,
  vecsToRotation,
} from "../utility/mathUtilities";
import { ObjMesh } from "../view/objMesh";
import { vec3 } from "gl-matrix";
import { BasicModel } from "../model/basicModel";

export class App {
  canvas: HTMLCanvasElement;
  renderer: Renderer;
  scene: Scene;

  // FIXME: temp
  //testObjMesh!: ObjMesh;

  // FIXME: reorganize querying HTML Elements do display debug info
  // FIXME: move HTMLElement to separate object/function/singleton

  keyLabel: HTMLElement;
  mouseXLabel: HTMLElement;
  mouseYLabel: HTMLElement;
  cameraPositionLabel: HTMLElement;

  // camera orientation labels
  cameraOrientationLabel: HTMLElement;
  cameraForwardsLabel: HTMLElement;
  cameraRightLabel: HTMLElement;
  cameraUpLabel: HTMLElement;

  moveMap: Map<String, Boolean>;
  acceleration: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer();
    this.scene = new Scene();

    this.keyLabel = document.querySelector("#key_label")!;
    this.mouseXLabel = document.querySelector("#mouse_x_label")!;
    this.mouseYLabel = document.querySelector("#mouse_y_label")!;
    // prettier-ignore
    this.cameraPositionLabel = document.querySelector("#camera_position_label")!;
    // prettier-ignore
    this.cameraOrientationLabel = document.querySelector("#camera_orientation_label")!;
    // prettier-ignore
    this.cameraForwardsLabel = document.querySelector("#camera_forwards_label")!;
    this.cameraRightLabel = document.querySelector("#camera_right_label")!;
    this.cameraUpLabel = document.querySelector("#camera_up_label")!;

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
    // TODO: Move assets initialization from Renderer
    await this.renderer.init();
    await this.scene.initFromJSON("./data/default.scene.json");
    //this.testObjMesh = await new ObjMesh().initFromFile("./data/cube.obj"); //FIXME: temp
  }

  run = () => {
    let running: boolean = true;
    let doAccelerate = this.moveMap.get("ShiftLeft");

    this.scene.updateScene();
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
      // FIXME: temp
      // const intersectionResult = rayIntersectionTest(
      //   this.scene.player.position,
      //   this.scene.player.forward,
      //   this.testObjMesh,
      //   new BasicModel(vec3.fromValues(-5, 0, 0.5)).update().getModel()
      // );
      // if (intersectionResult) console.log(intersectionResult.distance);
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

    const [fAngle, rAngle, uAngle] = vecsToRotation(
      this.scene.player.forward,
      this.scene.player.right,
      this.scene.player.up
    );

    this.cameraPositionLabel.innerHTML =
      "Camera position: " +
      Math.floor((this.scene.player.position[0] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((this.scene.player.position[1] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((this.scene.player.position[2] + Number.EPSILON) * 100) / 100;

    this.cameraForwardsLabel.innerHTML =
      " Forward: " +
      Math.floor((this.scene.player.forward[0] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((this.scene.player.forward[1] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((this.scene.player.forward[2] + Number.EPSILON) * 100) / 100 +
      " PSI:(" +
      Math.floor((rad2deg(fAngle) + Number.EPSILON) * 100) / 100 +
      ")";

    this.cameraRightLabel.innerHTML =
      " Right: " +
      Math.floor((this.scene.player.right[0] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((this.scene.player.right[1] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((this.scene.player.right[2] + Number.EPSILON) * 100) / 100 +
      " THETA:(" +
      Math.floor((rad2deg(rAngle) + Number.EPSILON) * 100) / 100 +
      ")";

    this.cameraUpLabel.innerHTML =
      " Up: " +
      Math.floor((this.scene.player.up[0] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((this.scene.player.up[1] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((this.scene.player.up[2] + Number.EPSILON) * 100) / 100 +
      " PHI:(" +
      Math.floor((rad2deg(uAngle) + Number.EPSILON) * 100) / 100 +
      ")";
  };
}
