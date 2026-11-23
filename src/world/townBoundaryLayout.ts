export type BoundaryRun = {
  from: [number, number];
  to: [number, number];
  height: number;
  collidable?: boolean;
};

// Separate runs leave the observatory route, lookout approach, and side views open.
export const rearStoneRuns: BoundaryRun[] = [
  { from: [-1.75, -10.15], to: [0.5, -10.75], height: 0.76, collidable: true },
  { from: [0.5, -10.75], to: [3.25, -10.6], height: 0.7, collidable: true },
  { from: [5.9, -10.95], to: [8.0, -10.5], height: 0.64, collidable: true },
  { from: [8.0, -10.5], to: [10.25, -10.25], height: 0.57, collidable: true },
];

export const sideStoneRuns: BoundaryRun[] = [
  { from: [-13.5, -3.5], to: [-13.4, -0.7], height: 0.58 },
  { from: [-13.4, 1.3], to: [-13.6, 4.1], height: 0.48 },
  { from: [-13.6, 5.7], to: [-13.4, 8.15], height: 0.55 },
  { from: [13.5, -4.1], to: [13.4, -1.1], height: 0.52 },
  { from: [13.4, 1.2], to: [13.6, 4.0], height: 0.61 },
  { from: [13.6, 5.7], to: [13.4, 8.2], height: 0.46 },
];

export const southStoneRuns: BoundaryRun[] = [
  { from: [-2.8, 9.45], to: [-5.7, 10.25], height: 0.54, collidable: true },
  { from: [-5.7, 10.25], to: [-10.5, 10.75], height: 0.42, collidable: true },
  { from: [2.8, 9.45], to: [5.7, 10.25], height: 0.54, collidable: true },
  { from: [5.7, 10.25], to: [10.5, 10.75], height: 0.42, collidable: true },
];

export const entrancePosts = [[-2.8, 9.45], [2.8, 9.45]] as const;

export const boundaryCollision = [
  ...[...rearStoneRuns, ...southStoneRuns].filter((run) => run.collidable).map((run) => ({
    minX: Math.min(run.from[0], run.to[0]) - 0.26,
    maxX: Math.max(run.from[0], run.to[0]) + 0.26,
    minZ: Math.min(run.from[1], run.to[1]) - 0.26,
    maxZ: Math.max(run.from[1], run.to[1]) + 0.26,
  })),
  ...entrancePosts.map(([x, z]) => ({ x, z, radius: 0.52 })),
];
