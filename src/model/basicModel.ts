import { mat4, vec3 } from "gl-matrix";
import { Model } from "../interfaces/Model";

export class BasicModel implements Model {
  position: vec3;
  eulers: vec3;
  scaler: vec3;
  model!: mat4;

  constructor(position: vec3) {
    this.position = position;
    this.eulers = vec3.create();
    this.scaler = vec3.fromValues(1, 1, 1);
  }

  update() {
    this.model = mat4.create();
    mat4.translate(this.model, this.model, this.position);
    mat4.scale(this.model, this.model, this.scaler);
  }

  getModel() {
    return this.model;
  }
}
