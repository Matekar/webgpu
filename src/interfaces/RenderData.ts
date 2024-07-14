import { mat4 } from "gl-matrix";
import { objectTypes } from "./enums";
import { Renderable } from "./Renderable";

export interface RenderData {
  viewTransform: mat4;
  modelTransforms: mat4;
  objectCounts: { [obj in objectTypes]: number };
}

export interface NewRenderData {
  viewTransform: mat4;
  renderables: Renderable[];
  modelTransforms: mat4;
  objectCount: number;
}
