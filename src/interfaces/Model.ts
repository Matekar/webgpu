import { mat4, vec3 } from "gl-matrix";
import { Mesh } from "./Mesh";

export interface Model {
  position: vec3;
  eulers?: vec3;
  scaler?: vec3;

  model: mat4;
  mesh: Mesh;

  update: () => void;

  getModel: () => mat4;

  getMesh: () => Mesh;
}
