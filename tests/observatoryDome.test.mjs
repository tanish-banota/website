import assert from 'node:assert/strict';
import test from 'node:test';
import { createObservatoryDome, panelGeometry } from '../src/world/observatoryDome.ts';

test('dome panels and ribs share one closed triangular edge layout', () => {
  const dome = createObservatoryDome();
  assert.equal(dome.vertices.length, 37);
  assert.equal(dome.triangles.length, 60);
  assert.equal(dome.edges.length, 96);
  const incidence = new Map();
  for (const triangle of dome.triangles) {
    assert.equal(new Set(triangle).size, 3);
    const geometry = panelGeometry(dome.vertices, triangle);
    assert.equal(geometry.getAttribute('position').count, 3);
    geometry.dispose();
    for (const [a, b] of [[triangle[0], triangle[1]], [triangle[1], triangle[2]], [triangle[2], triangle[0]]]) {
      const key = [a, b].sort((left, right) => left - right).join(':');
      incidence.set(key, (incidence.get(key) ?? 0) + 1);
    }
  }
  assert.deepEqual(new Set(dome.edges.map((edge) => edge.join(':'))), new Set(incidence.keys()));
  assert.equal([...incidence.values()].filter((count) => count === 1).length, 12);
  assert.ok([...incidence.values()].every((count) => count === 1 || count === 2));
});
