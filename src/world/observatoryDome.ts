import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';

export type DomeTriangle = [number, number, number];
export type DomeEdge = [number, number];

// One indexed triangular surface supplies both panels and structural edges.
// The offset middle ring makes the facets read as a framed shell at gameplay zoom.
export function createObservatoryDome() {
  const segments = 12;
  const vertices: Vector3[] = [];
  const rings = [
    { radius: 2.18, height: 1.28, offset: 0 },
    { radius: 1.77, height: 2.13, offset: 0.5 },
    { radius: 0.96, height: 2.76, offset: 0 },
  ];
  for (const ring of rings) {
    for (let index = 0; index < segments; index++) {
      const angle = (index + ring.offset) * Math.PI * 2 / segments;
      vertices.push(new Vector3(Math.sin(angle) * ring.radius, ring.height, Math.cos(angle) * ring.radius));
    }
  }
  const apex = vertices.length;
  vertices.push(new Vector3(0, 3.07, 0));
  const triangles: DomeTriangle[] = [];
  const ringVertex = (ring: number, index: number) => ring * segments + (index + segments) % segments;
  for (let ring = 0; ring < 2; ring++) {
    for (let index = 0; index < segments; index++) {
      triangles.push([ringVertex(ring, index), ringVertex(ring, index + 1), ringVertex(ring + 1, index)]);
      triangles.push([ringVertex(ring, index + 1), ringVertex(ring + 1, index + 1), ringVertex(ring + 1, index)]);
    }
  }
  for (let index = 0; index < segments; index++) {
    triangles.push([ringVertex(2, index), ringVertex(2, index + 1), apex]);
  }
  // Flat panels need outward normals; correct each face from its shared vertices.
  for (const triangle of triangles) {
    const [a, b, c] = triangle.map((index) => vertices[index]);
    const normal = new Vector3().subVectors(b, a).cross(new Vector3().subVectors(c, a));
    const outward = new Vector3().addVectors(a, b).add(c);
    outward.y = Math.max(0.2, outward.y - 3.5);
    if (normal.dot(outward) < 0) [triangle[1], triangle[2]] = [triangle[2], triangle[1]];
  }
  const edgeMap = new Map<string, DomeEdge>();
  for (const [a, b, c] of triangles) {
    for (const [from, to] of [[a, b], [b, c], [c, a]]) {
      const edge: DomeEdge = from < to ? [from, to] : [to, from];
      edgeMap.set(`${edge[0]}:${edge[1]}`, edge);
    }
  }
  return { vertices, triangles, edges: [...edgeMap.values()] };
}

export function panelGeometry(vertices: Vector3[], [a, b, c]: DomeTriangle) {
  const points = [vertices[a], vertices[b], vertices[c]];
  const center = new Vector3().add(points[0]).add(points[1]).add(points[2]).multiplyScalar(1 / 3);
  const positions = points.flatMap((point) => {
    const inset = center.clone().lerp(point, 0.965);
    return [inset.x, inset.y, inset.z];
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}
