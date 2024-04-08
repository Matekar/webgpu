import { mat4 } from "gl-matrix";

export enum objectTypes {
  TRIANGLE,
  QUAD,
}

export enum RenderMode {
  UNLIT,
  WIREFRAME,
}

export interface RenderData {
  viewTransform: mat4;
  modelTransforms: mat4;
  objectCounts: { [obj in objectTypes]: number };
}
