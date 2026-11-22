export type Point = { x: number; z: number };
export type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };

export const PLAYER_RADIUS = 0.3;
export const WALK_SPEED = 3;
export const MAX_FRAME_DELTA = 0.033;

// The visible terrain is 25.8 x 20.8, centered on the origin.
export const townBounds: Rect = { minX: -12.9, maxX: 12.9, minZ: -10.4, maxZ: 10.4 };
export const townSpawn: Point = { x: 0, z: 3.5 };
export const townReturnSpawn: Point = { x: -7.0, z: -3.5 };
export const observatorySpawn: Point = { x: 0, z: 1.4 };
export const observatoryBounds: Rect = { minX: -2.4, maxX: 2.4, minZ: -2.8, maxZ: 3.1 };
export const observatoryObstacles: Rect[] = [
  { minX: -0.58, maxX: 0.58, minZ: -1.8, maxZ: -0.65 }, // telescope pedestal
  { minX: -1.2, maxX: -0.9, minZ: 2.8, maxZ: 3.2 }, // exit frame
  { minX: 0.9, maxX: 1.2, minZ: 2.8, maxZ: 3.2 },
];

// Hand-authored ground footprints for Phase 2 geometry. Decorative roofs do not affect walking.
export const townObstacles: Rect[] = [
  { minX: -1.15, maxX: 1.15, minZ: -2.75, maxZ: -0.65 }, // clock tower
  { minX: -7.75, maxX: -5.25, minZ: 2.0, maxZ: 2.3 }, // notice board
  { minX: 4.35, maxX: 8.65, minZ: -3.2, maxZ: -0.1 }, // town hall
  { minX: 7.0, maxX: 7.8, minZ: 4.33, maxZ: 4.97 }, // post box
  { minX: -10.65, maxX: -5.95, minZ: -8.8, maxZ: -4.1 }, // observatory
  { minX: 1.85, maxX: 4.05, minZ: -7.2, maxZ: -5.2 }, // house
  { minX: 8.45, maxX: 10.35, minZ: -7.25, maxZ: -5.35 }, // house
  { minX: -11.42, maxX: -11.08, minZ: 2.43, maxZ: 2.77 },
  { minX: -11.38, maxX: -11.02, minZ: -2.78, maxZ: -2.42 },
  { minX: -4.35, maxX: -4.05, minZ: -7.85, maxZ: -7.55 },
  { minX: 3.25, maxX: 3.55, minZ: -8.45, maxZ: -8.15 },
  { minX: 10.55, maxX: 10.85, minZ: 1.55, maxZ: 1.85 },
  { minX: 10.42, maxX: 10.78, minZ: 7.22, maxZ: 7.58 },
  { minX: -3.43, maxX: -3.27, minZ: -0.58, maxZ: -0.42 },
  { minX: -6.03, maxX: -5.87, minZ: -3.98, maxZ: -3.82 },
  { minX: 3.37, maxX: 3.53, minZ: 2.12, maxZ: 2.28 },
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
