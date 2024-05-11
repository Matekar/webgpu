import { vec3 } from "gl-matrix";

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
