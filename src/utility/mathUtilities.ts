import { ReadonlyMat4, vec3, vec4 } from "gl-matrix";
import { ObjMesh } from "../view/objMesh";

export function deg2rad(theta: number): number {
  return (theta * Math.PI) / 180;
}

export function rad2deg(theta: number): number {
  return (180 * theta) / Math.PI;
}

export function vecsToRotation(forward: vec3, right: vec3, up: vec3): number[] {
  const forwardAngle = Math.atan2(forward[1], forward[0]);
  const upAngle = Math.asin(forward[2]);

  const W0 = vec3.fromValues(-forward[1], forward[1], 0);
  const U0 = vec3.cross(vec3.create(), W0, forward);
  const rightAngle = Math.atan2(
    vec3.dot(W0, up) / vec3.len(W0),
    vec3.dot(U0, up) / vec3.len(U0)
  );

  return [forwardAngle, rightAngle, upAngle];
}

export module cvec3 {
  export function fromVec4(vec: vec4): vec3 {
    return vec3.fromValues(vec[0], vec[1], vec[2]);
  }
}

export function rayIntersectionTest(
  rayOrigin: vec3,
  rayDirection: vec3,
  mesh: ObjMesh,
  modelMatrix: ReadonlyMat4
): { point: vec3; distance: number } | null {
  let closestIntersection = Infinity;
  let closestIntersectionPoint = null;

  for (let i = 0; i < mesh.f.length; i += 3) {
    // calculated moved vertices
    const vA = cvec3.fromVec4(
      vec4.transformMat4(vec4.create(), mesh.f[i].v, modelMatrix)
    );
    const vB = cvec3.fromVec4(
      vec4.transformMat4(vec4.create(), mesh.f[i + 1].v, modelMatrix)
    );
    const vC = cvec3.fromVec4(
      vec4.transformMat4(vec4.create(), mesh.f[i + 2].v, modelMatrix)
    );

    const e1 = vec3.subtract(vec3.create(), vB, vA);
    const e2 = vec3.subtract(vec3.create(), vC, vA);

    const rxe2 = vec3.cross(vec3.create(), rayDirection, e2);
    const det = vec3.dot(e1, rxe2);

    if (det > -Number.EPSILON && det < Number.EPSILON) continue;

    const inv_det = 1.0 / det;
    const s = vec3.subtract(vec3.create(), rayOrigin, vA);
    const u = inv_det * vec3.dot(s, rxe2);

    if (u < 0.0 || u > 1.0) continue;

    const sxe1 = vec3.cross(vec3.create(), s, e1);
    const v = inv_det * vec3.dot(rayDirection, sxe1);

    if (v < 0.0 || u + v > 1.0) continue;

    const t = inv_det * vec3.dot(e2, sxe1);

    if (t > Number.EPSILON && t < closestIntersection) {
      closestIntersection = t;
      closestIntersectionPoint = vec3.scaleAndAdd(
        vec3.create(),
        rayOrigin,
        rayDirection,
        t
      );
    }
  }

  if (closestIntersectionPoint) {
    return { point: closestIntersectionPoint, distance: closestIntersection };
  } else {
    return null;
  }
}
