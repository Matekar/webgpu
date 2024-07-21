import { vec3, vec4 } from "gl-matrix";

export interface SceneData {
  author: string;
  version: string;
  license: string;

  backgroundColor: vec4 | undefined;
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
