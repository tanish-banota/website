export type Point = { x: number; z: number };
export type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };

export const PLAYER_RADIUS = 0.3;
export const WALK_SPEED = 3;
export const MAX_FRAME_DELTA = 0.033;

// The visible terrain is 25.8 x 20.8, centered on the origin.
export const townBounds: Rect = { minX: -12.9, maxX: 12.9, minZ: -10.4, maxZ: 10.4 };
export const townSpawn: Point = { x: 0, z: 4.25 };
export const townReturnSpawn: Point = { x: -7.1, z: -3.25 };
export const observatorySpawn: Point = { x: 0, z: 1.4 };
export const observatoryBounds: Rect = { minX: -2.4, maxX: 2.4, minZ: -2.8, maxZ: 3.1 };
export const observatoryObstacles: Rect[] = [
  { minX: -0.58, maxX: 0.58, minZ: -1.8, maxZ: -0.65 }, // telescope pedestal
  { minX: -1.2, maxX: -0.9, minZ: 2.8, maxZ: 3.2 }, // exit frame
  { minX: 0.9, maxX: 1.2, minZ: 2.8, maxZ: 3.2 },
];

// Hand-authored ground footprints for Phase 2 geometry. Decorative roofs do not affect walking.
export const townObstacles: Rect[] = [
  { minX: -1.5, maxX: 1.5, minZ: -0.15, maxZ: 2.85 }, // fountain basin, including stone rim
  { minX: -3.2, maxX: 3.2, minZ: -5.05, maxZ: -2.38 }, // clock tower and side walls
  { minX: -3.7, maxX: -2.9, minZ: -1.1, maxZ: -0.3 }, // rear plaza planters
  { minX: 2.9, maxX: 3.7, minZ: -1.1, maxZ: -0.3 },
  { minX: -3.7, maxX: -2.9, minZ: 3.0, maxZ: 3.8 }, // front plaza planters
  { minX: 2.9, maxX: 3.7, minZ: 3.0, maxZ: 3.8 },
  { minX: -7.75, maxX: -5.25, minZ: 2.0, maxZ: 2.3 }, // notice board
  { minX: 4.35, maxX: 8.65, minZ: -3.2, maxZ: -0.1 }, // town hall
  { minX: 7.0, maxX: 7.8, minZ: 4.33, maxZ: 4.97 }, // post box
  { minX: -10.72, maxX: -5.88, minZ: -8.87, maxZ: -4.03 }, // faceted observatory base
  { minX: -8.9, maxX: -7.7, minZ: -4.16, maxZ: -3.85 }, // entrance vestibule
  { minX: 1.85, maxX: 4.05, minZ: -7.2, maxZ: -5.2 }, // house
  { minX: 8.45, maxX: 10.35, minZ: -7.25, maxZ: -5.35 }, // house
  { minX: -11.42, maxX: -11.08, minZ: 2.43, maxZ: 2.77 },
  { minX: -11.38, maxX: -11.02, minZ: -2.78, maxZ: -2.42 },
  { minX: -4.35, maxX: -4.05, minZ: -7.85, maxZ: -7.55 },
  { minX: 4.65, maxX: 4.95, minZ: -7.65, maxZ: -7.35 },
  { minX: 3.55, maxX: 4.25, minZ: -3.9, maxZ: -3.15 }, // flower planter
  { minX: 10.55, maxX: 10.85, minZ: 1.55, maxZ: 1.85 },
  { minX: 10.42, maxX: 10.78, minZ: 7.22, maxZ: 7.58 },
  { minX: -4.63, maxX: -4.47, minZ: 0.17, maxZ: 0.33 },
  { minX: -6.03, maxX: -5.87, minZ: -3.98, maxZ: -3.82 },
  { minX: 4.52, maxX: 4.68, minZ: 2.02, maxZ: 2.18 },
];

export function blocked(x: number, z: number, radius: number, obstacles: Rect[], bounds: Rect): boolean {
  if (x - radius < bounds.minX || x + radius > bounds.maxX || z - radius < bounds.minZ || z + radius > bounds.maxZ) {
    return true;
  }
  return obstacles.some((rect) =>
    x > rect.minX - radius && x < rect.maxX + radius &&
    z > rect.minZ - radius && z < rect.maxZ + radius,
  );
}

export function moveOnGround(position: Point, input: Point, delta: number, obstacles: Rect[], bounds: Rect, radius = PLAYER_RADIUS): Point {
  const length = Math.hypot(input.x, input.z);
  if (length === 0 || delta <= 0) return position;

  const step = WALK_SPEED * Math.min(delta, MAX_FRAME_DELTA) / Math.max(1, length);
  let { x, z } = position;
  const nextX = x + input.x * step;
  if (!blocked(nextX, z, radius, obstacles, bounds)) x = nextX;
  const nextZ = z + input.z * step;
  if (!blocked(x, nextZ, radius, obstacles, bounds)) z = nextZ;
  return { x, z };
}
