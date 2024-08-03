import { Renderer } from "../view/renderer";
import { Scene } from "../model/scene";
import { RenderMode } from "../interfaces/enums";
import cDebugInfo from "./debugInfo";

export class App {
  canvas: HTMLCanvasElement;
  renderer: Renderer;
  scene: Scene;

  // FIXME: temp
  //testObjMesh!: ObjMesh;

  // FIXME: reorganize querying HTML Elements do display debug info
  // FIXME: move HTMLElement to separate object/function/singleton

  moveMap: Map<String, Boolean>;
  acceleration: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer();
    this.scene = new Scene();

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

    cDebugInfo.printDebugInfo(this.scene, this.moveMap);

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
    cDebugInfo.registerMouseInfo(
      [event.clientX, event.clientY],
      [event.movementX, event.movementY]
    );

    this.scene.spinPlayer(event.movementX * 0.2, event.movementY * 0.2);
  }
}
