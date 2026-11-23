import assert from 'node:assert/strict';
import test from 'node:test';
import { townBounds } from '../src/world/collision.ts';
import { townCameraFocus, townCameraZoom } from '../src/world/townCamera.ts';

test('town camera zoom gives portrait exploration a useful scale', () => {
  const desktop = townCameraZoom(1440, 900);
  const narrow = townCameraZoom(390, 844);
  assert.ok(desktop > 1440 / 27 * 1.2 && desktop < 1440 / 27 * 1.35);
  assert.ok(narrow > 390 / 27 * 2);
});

test('town camera keeps the player visible at each map edge', () => {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const zoom = townCameraZoom(width, height);
    const halfWidth = width / (2 * zoom);
    const halfGroundDepth = height / (2 * zoom * (18 / Math.hypot(18, 20)));
    for (const x of [townBounds.minX, 0, townBounds.maxX]) {
      for (const z of [townBounds.minZ, 0, townBounds.maxZ]) {
        const focus = townCameraFocus({ x, z }, width, height, zoom);
        assert.ok(Math.abs(x - focus.x) < halfWidth * 0.75);
        assert.ok(Math.abs(z - focus.z) < halfGroundDepth * 0.75);
      }
    }
  }
});
