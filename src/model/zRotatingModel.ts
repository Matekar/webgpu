import { vec3, mat4 } from "gl-matrix";
import { deg2rad } from "../utility/mathUtilities";
import { BasicModel } from "./basicModel";
import { Mesh } from "../interfaces/Mesh";

export class ZRotatingModel extends BasicModel {
  constructor(position: vec3, mesh: Mesh, theta: number) {
    super(position, mesh);
    this.eulers[2] = theta;
  }

  update = () => {
    this.eulers[2] += 1;
    this.eulers[2] %= 360;

    super.update();
    mat4.rotateZ(this.model, this.model, deg2rad(this.eulers[2]));
  };
}
