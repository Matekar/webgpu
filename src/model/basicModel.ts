import { ReadonlyMat4, mat4, vec3 } from "gl-matrix";
import { Model } from "../interfaces/Model";

export class BasicModel implements Model {
  position: vec3;
  eulers: vec3;
  scale: vec3;

  model!: mat4;

  constructor(
    position: vec3,
    eulers: vec3 = vec3.create(),
    scale: vec3 = vec3.fromValues(1, 1, 1)
  ) {
    this.position = position;
    this.eulers = eulers;
    this.scale = scale;
  }

  update(): BasicModel {
    this.model = mat4.create();
    mat4.translate(this.model, this.model, this.position);
    mat4.scale(this.model, this.model, this.scale);

    return this;
  }

  getModel(): ReadonlyMat4 {
    return this.model;
  }
}
