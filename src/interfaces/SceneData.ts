import { vec3 } from "gl-matrix";

export interface SceneData {
  author: string;
  version: string;
  license: string;

  cameras: { position: vec3; rotation: vec3 }[];
  objects: {
    name: string;
    position: vec3;
    rotation: vec3;
    scale: vec3;
    meshName: string;
    materialName: string;
  }[];
}
