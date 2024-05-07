import { vec2, vec3, vec4 } from "gl-matrix";

export interface Face {
  v: vec4;
  vt: vec2;
  vn: vec3;
}

export module Face {
  export function create(): Face {
    return {
      v: vec4.create(),
      vt: vec2.create(),
      vn: vec3.create(),
    };
  }

  export function fromValues(v: vec4, vt: vec2, vn: vec3): Face {
    return { v, vt, vn };
  }

  export function toFloat32Array(from: Face): Float32Array {
    return new Float32Array([...from.v, ...from.vt, ...from.vn]);
  }
}
