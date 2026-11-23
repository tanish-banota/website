import { townBounds } from './collision.ts';
import type { Point } from './collision.ts';

// Keep the plaza legible on wide screens and avoid a tiny, full-map view in portrait.
const viewHeight = 13;
const minimumViewWidth = 9.5;
const maximumViewWidth = 21;
const forwardFocus = 7.5;
const cameraHeight = 18;
const cameraDepth = 20;

export const townCameraOffset = { height: cameraHeight, depth: cameraDepth };

export function townCameraZoom(width: number, height: number) {
  const aspect = width / height;
  const viewWidth = Math.min(maximumViewWidth, Math.max(minimumViewWidth, viewHeight * aspect));
  return Math.min(width / viewWidth, height / viewHeight);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function townCameraFocus(player: Point, width: number, height: number, zoom: number): Point {
  const halfWidth = width / (2 * zoom);
  // The vertical frustum is tilted down, so its footprint on level terrain is longer.
  const tiltCosine = cameraHeight / Math.hypot(cameraHeight, cameraDepth);
  const halfGroundDepth = height / (2 * zoom * tiltCosine);
  const xInset = halfWidth * 0.55;
  const zInset = halfGroundDepth * 0.55;
  // Ease the look-ahead back near the southern limit so the player has room below.
  const south = clamp((player.z - 4.25) / 5.75, 0, 1);
  const lookAhead = forwardFocus - 2 * south * south * (3 - 2 * south);
  return {
    x: clamp(player.x * 0.85, townBounds.minX + xInset, townBounds.maxX - xInset),
    z: clamp(player.z - lookAhead, townBounds.minZ + zInset, townBounds.maxZ - zInset),
  };
}
