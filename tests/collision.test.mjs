import assert from 'node:assert/strict';
import test from 'node:test';
import {
  blocked,
  MAX_FRAME_DELTA,
  moveOnGround,
  PLAYER_RADIUS,
  townBounds,
  townObstacles,
  townSpawn,
  WALK_SPEED,
} from '../src/world/collision.ts';

const openBounds = { minX: -20, maxX: 20, minZ: -20, maxZ: 20 };

test('diagonal movement has the same speed as cardinal movement', () => {
  const straight = moveOnGround({ x: 0, z: 0 }, { x: 1, z: 0 }, MAX_FRAME_DELTA, [], openBounds);
  const diagonal = moveOnGround({ x: 0, z: 0 }, { x: 1, z: 1 }, MAX_FRAME_DELTA, [], openBounds);
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.z) - straight.x) < 1e-10);
  assert.equal(straight.x, WALK_SPEED * MAX_FRAME_DELTA);
});

test('expanded rectangle blocks its corner and allows a wall slide', () => {
  const wall = [{ minX: 1, maxX: 2, minZ: 1, maxZ: 2 }];
  assert.equal(blocked(1 - PLAYER_RADIUS + 0.01, 1 - PLAYER_RADIUS + 0.01, PLAYER_RADIUS, wall, openBounds), true);
  assert.equal(blocked(1 - PLAYER_RADIUS, 1 - PLAYER_RADIUS, PLAYER_RADIUS, wall, openBounds), false);

  const next = moveOnGround({ x: 0.69, z: 0.8 }, { x: 1, z: 1 }, MAX_FRAME_DELTA, wall, openBounds);
  assert.equal(next.x, 0.69);
  assert.ok(next.z > 0.8);
  assert.equal(blocked(next.x, next.z, PLAYER_RADIUS, wall, openBounds), false);
});

test('ground edge blocks outward motion while allowing motion along the edge', () => {
  const start = { x: townBounds.maxX - PLAYER_RADIUS - 0.02, z: 0 };
  const next = moveOnGround(start, { x: 1, z: 1 }, MAX_FRAME_DELTA, [], townBounds);
  assert.equal(next.x, start.x);
  assert.ok(next.z > start.z);
  assert.equal(blocked(townBounds.maxX - PLAYER_RADIUS + 0.001, 0, PLAYER_RADIUS, [], townBounds), true);
  assert.equal(blocked(townBounds.minX + PLAYER_RADIUS - 0.001, 0, PLAYER_RADIUS, [], townBounds), true);
  assert.equal(blocked(0, townBounds.maxZ - PLAYER_RADIUS + 0.001, PLAYER_RADIUS, [], townBounds), true);
  assert.equal(blocked(0, townBounds.minZ + PLAYER_RADIUS - 0.001, PLAYER_RADIUS, [], townBounds), true);
});

test('long frames are clamped and the town spawn starts clear', () => {
  assert.equal(blocked(townSpawn.x, townSpawn.z, PLAYER_RADIUS, townObstacles, townBounds), false);
  const normal = moveOnGround(townSpawn, { x: 1, z: 0 }, MAX_FRAME_DELTA, townObstacles, townBounds);
  const stalled = moveOnGround(townSpawn, { x: 1, z: 0 }, 2, townObstacles, townBounds);
  assert.deepEqual(stalled, normal);
});
