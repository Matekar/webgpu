import { mat4, vec3 } from "gl-matrix";
import { Model } from "../interfaces/Model";

export class basicModel implements Model {
  position: vec3;
  eulers: vec3;
  model!: mat4;

  constructor(position: vec3) {
    this.position = position;
    this.eulers = vec3.create();
  }

  update = () => {
    this.model = mat4.create();
    mat4.translate(this.model, this.model, this.position);
  };

  getModel = () => {
    return this.model;
  };
}
