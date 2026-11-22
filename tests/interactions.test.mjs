import assert from 'node:assert/strict';
import test from 'node:test';
import { blocked, PLAYER_RADIUS, townBounds, townObstacles } from '../src/world/collision.ts';
import { anchors, nearestAnchor } from '../src/world/interactions.ts';

test('nearest valid anchor wins and exactly one target is returned', () => {
  const candidates = [
    { id: 'far', scene: 'town', x: 1, z: 0, radius: 2, label: 'Far', target: 'about' },
    { id: 'near', scene: 'town', x: 0.2, z: 0, radius: 2, label: 'Near', target: 'contact' },
  ];
  assert.equal(nearestAnchor(0, 0, 'town', candidates)?.id, 'near');
  assert.equal(nearestAnchor(4, 0, 'town', candidates), null);
  assert.equal(nearestAnchor(3, 0, 'town', candidates)?.id, 'far');
});

test('anchors from another scene cannot be selected', () => {
  const candidates = [
    { id: 'town', scene: 'town', x: 0, z: 0, radius: 1, label: 'Town', target: 'about' },
    { id: 'inside', scene: 'observatory', x: 0, z: 0, radius: 1, label: 'Inside', target: 'tranquility-base' },
  ];
  assert.equal(nearestAnchor(0, 0, 'town', candidates)?.id, 'town');
  assert.equal(nearestAnchor(0, 0, 'observatory', candidates)?.id, 'inside');
  assert.equal(nearestAnchor(0, 0, 'observatory', anchors), null);
});

test('town interaction points stand on reachable ground', () => {
  assert.equal(anchors.length, 4);
  for (const anchor of anchors) {
    assert.equal(blocked(anchor.x, anchor.z, PLAYER_RADIUS, townObstacles, townBounds), false, anchor.id);
    assert.equal(nearestAnchor(anchor.x, anchor.z, 'town', anchors)?.id, anchor.id);
  }
});
