import assert from 'node:assert/strict';
import test from 'node:test';
import { observatoryBounds, observatorySpawn } from '../src/world/collision.ts';
import { interiorCameraOffset, interiorCameraPreset } from '../src/world/interiorCamera.ts';

test('interior camera follow stays outside the enclosure with fixed orientation', () => {
  for (const x of [observatoryBounds.minX, 0, observatoryBounds.maxX]) {
    for (const z of [observatoryBounds.minZ, observatorySpawn.z, observatoryBounds.maxZ]) {
      const follow = interiorCameraOffset({ x, z }, observatorySpawn);
      const camera = { x: follow.x, y: interiorCameraPreset.height, z: interiorCameraPreset.depth + follow.z };
      const target = { x: follow.x, y: interiorCameraPreset.targetHeight, z: interiorCameraPreset.targetZ + follow.z };
      assert.ok(Math.hypot(camera.x, camera.z) > 4.2, 'camera stays beyond the room wall');
      assert.ok(camera.z >= 8.2 && camera.z <= 8.6, 'camera follow is constrained');
      assert.equal(camera.x - target.x, 0);
      assert.equal(camera.y - target.y, interiorCameraPreset.height - interiorCameraPreset.targetHeight);
      assert.equal(camera.z - target.z, interiorCameraPreset.depth - interiorCameraPreset.targetZ);
    }
  }
});
