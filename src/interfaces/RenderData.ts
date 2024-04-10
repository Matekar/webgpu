import { mat4 } from "gl-matrix";
import { objectTypes } from "./enums";

export interface RenderData {
  viewTransform: mat4;
  modelTransforms: mat4;
  objectCounts: { [obj in objectTypes]: number };
}
