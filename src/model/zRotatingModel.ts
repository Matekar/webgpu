import { vec3, mat4 } from "gl-matrix";
import { deg2rad } from "../utility/mathUtilities";
import { BasicModel } from "./basicModel";

export class ZRotatingModel extends BasicModel {
  constZRotation: number;

  constructor(position: vec3, constZRotation: number) {
    super(position);
    this.constZRotation = constZRotation;
  }

  update = () => {
    this.eulers[2] += this.constZRotation;
    this.eulers[2] %= 360;

    super.update();
    mat4.rotateZ(this.model, this.model, deg2rad(this.eulers[2]));

    return this;
  };
}
