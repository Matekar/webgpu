import { mat4 } from "gl-matrix";
import { Renderable } from "./Renderable";

export interface RenderData {
  viewTransform: mat4;
  renderables: Renderable[];
  modelTransforms: Float32Array;
  objectCount: number;
}
