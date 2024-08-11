import { Scene } from "../model/scene";
import { rad2deg, vecsToRotation } from "../utility/mathUtilities";

class DebugInfo {
  // pressed keys info
  keyLabel: HTMLElement;

  // mouse info
  mousePositionLabel: HTMLElement;
  mouseAccelerationLabel: HTMLElement;

  // topLeft
  // camera info
  cameraPositionLabel: HTMLElement;
  cameraOrientationLabel: HTMLElement;
  cameraForwardsLabel: HTMLElement;
  cameraRightLabel: HTMLElement;
  cameraUpLabel: HTMLElement;

  // bottomLeft
  objectNameLabel: HTMLElement;

  constructor() {
    this.keyLabel = this.queryOne("#key_label")!;

    this.mousePositionLabel = this.queryOne("#mouse_position_label")!;
    this.mouseAccelerationLabel = this.queryOne("#mouse_acceleration_label")!;

    this.cameraPositionLabel = this.queryOne("#camera_position_label")!;
    this.cameraOrientationLabel = this.queryOne("#camera_orientation_label")!;
    this.cameraForwardsLabel = this.queryOne("#camera_forwards_label")!;
    this.cameraRightLabel = this.queryOne("#camera_right_label")!;
    this.cameraUpLabel = this.queryOne("#camera_up_label")!;

    this.objectNameLabel = this.queryOne("#objectName")!;
  }

  queryOne = (selector: string): HTMLElement =>
    document.querySelector(selector)!;

  registerMouseInfo = (position: number[], acceleration: number[]) => {
    this.mousePositionLabel.innerHTML =
      "Mouse position (XY): " + position.toString();
    this.mouseAccelerationLabel.innerHTML =
      "Mouse acceleration (XY): " + acceleration.toString();
  };

  displayHighlitedName = (name: string) =>
    (this.objectNameLabel.innerHTML = name);

  printDebugInfo = (scene: Scene, moveMap: Map<String, Boolean>) => {
    this.keyLabel.innerText = "Current keys: [";
    moveMap.forEach((v, k) => (this.keyLabel.innerText += v ? k + " " : ""));
    this.keyLabel.innerText += "]";

    const [fAngle, rAngle, uAngle] = vecsToRotation(
      scene.player.forward,
      scene.player.right,
      scene.player.up
    );

    this.cameraPositionLabel.innerHTML =
      "Camera position: " +
      Math.floor((scene.player.position[0] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((scene.player.position[1] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((scene.player.position[2] + Number.EPSILON) * 100) / 100;

    this.cameraForwardsLabel.innerHTML =
      " Forward: " +
      Math.floor((scene.player.forward[0] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((scene.player.forward[1] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((scene.player.forward[2] + Number.EPSILON) * 100) / 100 +
      " PSI:(" +
      Math.floor((rad2deg(fAngle) + Number.EPSILON) * 100) / 100 +
      ")";

    this.cameraRightLabel.innerHTML =
      " Right: " +
      Math.floor((scene.player.right[0] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((scene.player.right[1] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((scene.player.right[2] + Number.EPSILON) * 100) / 100 +
      " THETA:(" +
      Math.floor((rad2deg(rAngle) + Number.EPSILON) * 100) / 100 +
      ")";

    this.cameraUpLabel.innerHTML =
      " Up: " +
      Math.floor((scene.player.up[0] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((scene.player.up[1] + Number.EPSILON) * 100) / 100 +
      ", " +
      Math.floor((scene.player.up[2] + Number.EPSILON) * 100) / 100 +
      " PHI:(" +
      Math.floor((rad2deg(uAngle) + Number.EPSILON) * 100) / 100 +
      ")";
  };
}

const cDebugInfo = new DebugInfo();

export default cDebugInfo;
