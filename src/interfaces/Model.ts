import { ReadonlyMat4, mat4, vec3 } from "gl-matrix";

export interface Model {
  position: vec3;
  eulers?: vec3;
  scale?: vec3;

  model: mat4;

  update: () => Model;

  getModel: () => ReadonlyMat4;
}
