import type { Point } from './collision';

export const interiorCameraPreset = {
  height: 5.1,
  depth: 8.4,
  targetHeight: 2.15,
  targetZ: -0.65,
  followX: 0.14,
  followZ: 0.1,
  maxFollowX: 0.3,
  maxFollowZ: 0.2,
} as const;

export function interiorCameraOffset(position: Point, spawn: Point) {
  return {
    x: Math.max(-interiorCameraPreset.maxFollowX,
      Math.min(interiorCameraPreset.maxFollowX, position.x * interiorCameraPreset.followX)),
    z: Math.max(-interiorCameraPreset.maxFollowZ,
      Math.min(interiorCameraPreset.maxFollowZ, (position.z - spawn.z) * interiorCameraPreset.followZ)),
  };
}
