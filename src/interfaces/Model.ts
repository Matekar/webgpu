import { ReadonlyMat4, mat4, vec3 } from "gl-matrix";
import { Mesh } from "./Mesh";

export interface Model {
  position: vec3;
  eulers?: vec3;
  scaler?: vec3;

  model: mat4;
  mesh: Mesh;

  update: () => Model;

  getModel: () => ReadonlyMat4;

  getMesh: () => Mesh;
}
