import { mat4, vec3 } from "gl-matrix";

export interface Model {
  position: vec3;
  eulers?: vec3;
  model: mat4;
}
