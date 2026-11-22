import assert from 'node:assert/strict';
import test from 'node:test';
import { blocked, observatoryBounds, observatoryObstacles, observatorySpawn, PLAYER_RADIUS, townBounds, townObstacles, townReturnSpawn, townSpawn } from '../src/world/collision.ts';
import { anchors, nearestAnchor } from '../src/world/interactions.ts';

test('nearest valid anchor wins and exactly one target is returned', () => {
  const candidates = [
    { id: 'far', scene: 'town', x: 1, z: 0, radius: 2, label: 'Far', target: { type: 'panel', id: 'about' } },
    { id: 'near', scene: 'town', x: 0.2, z: 0, radius: 2, label: 'Near', target: { type: 'panel', id: 'contact' } },
  ];
  assert.equal(nearestAnchor(0, 0, 'town', candidates)?.id, 'near');
  assert.equal(nearestAnchor(4, 0, 'town', candidates), null);
  assert.equal(nearestAnchor(3, 0, 'town', candidates)?.id, 'far');
});

test('anchors from another scene cannot be selected', () => {
  const candidates = [
    { id: 'town', scene: 'town', x: 0, z: 0, radius: 1, label: 'Town', target: { type: 'panel', id: 'about' } },
    { id: 'inside', scene: 'observatory', x: 0, z: 0, radius: 1, label: 'Inside', target: { type: 'panel', id: 'tranquility-base' } },
  ];
  assert.equal(nearestAnchor(0, 0, 'town', candidates)?.id, 'town');
  assert.equal(nearestAnchor(0, 0, 'observatory', candidates)?.id, 'inside');
  assert.equal(nearestAnchor(0, 0, 'observatory', anchors)?.id, 'telescope');
});

test('town and interior anchors and transition spawns are clear of obstacles', () => {
  assert.equal(anchors.filter((anchor) => anchor.scene === 'town').length, 6);
  assert.equal(anchors.filter((anchor) => anchor.scene === 'observatory').length, 2);
  for (const anchor of anchors.filter((item) => item.scene === 'town')) {
    assert.equal(blocked(anchor.x, anchor.z, PLAYER_RADIUS, townObstacles, townBounds), false, anchor.id);
    assert.equal(nearestAnchor(anchor.x, anchor.z, 'town', anchors)?.id, anchor.id);
  }
  for (const anchor of anchors.filter((item) => item.scene === 'observatory')) {
    assert.equal(blocked(anchor.x, anchor.z, PLAYER_RADIUS, observatoryObstacles, observatoryBounds), false, anchor.id);
    assert.equal(nearestAnchor(anchor.x, anchor.z, 'observatory', anchors)?.id, anchor.id);
  }
  assert.equal(blocked(townReturnSpawn.x, townReturnSpawn.z, PLAYER_RADIUS, townObstacles, townBounds), false);
  assert.equal(blocked(observatorySpawn.x, observatorySpawn.z, PLAYER_RADIUS, observatoryObstacles, observatoryBounds), false);
  assert.deepEqual(anchors.find((anchor) => anchor.id === 'observatory-door')?.target, { type: 'scene', id: 'observatory' });
  assert.deepEqual(anchors.find((anchor) => anchor.id === 'observatory-exit')?.target, { type: 'scene', id: 'town' });
  assert.deepEqual(anchors.find((anchor) => anchor.id === 'north-lookout')?.target, { type: 'lookout' });
});

test('the fountain has two clear side routes and every town interaction is reachable', () => {
  assert.equal(blocked(0, 1.35, PLAYER_RADIUS, townObstacles, townBounds), true);
  for (const x of [-2.15, 2.15]) {
    for (let z = -1.6; z <= 4.25; z += 0.25) {
      assert.equal(blocked(x, z, PLAYER_RADIUS, townObstacles, townBounds), false, `side route ${x}, ${z}`);
    }
  }
  const step = 0.25;
  const minX = -12.5;
  const minZ = -10;
  const width = 101;
  const height = 81;
  const start = [Math.round((townSpawn.x - minX) / step), Math.round((townSpawn.z - minZ) / step)];
  const queue = [start];
  const visited = new Set([`${start[0]},${start[1]}`]);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const [ix, iz] = queue[cursor];
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = ix + dx;
      const nz = iz + dz;
      const key = `${nx},${nz}`;
      if (nx < 0 || nx >= width || nz < 0 || nz >= height || visited.has(key)) continue;
      if (blocked(minX + nx * step, minZ + nz * step, PLAYER_RADIUS, townObstacles, townBounds)) continue;
      visited.add(key);
      queue.push([nx, nz]);
    }
  }
  for (const target of [...anchors.filter((anchor) => anchor.scene === 'town'), townReturnSpawn]) {
    assert.ok(queue.some(([ix, iz]) => Math.hypot(minX + ix * step - target.x, minZ + iz * step - target.z) < 0.35),
      `${target.id ?? 'town return spawn'} is unreachable`);
  }
});
