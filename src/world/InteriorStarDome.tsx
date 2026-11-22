import { useMemo } from 'react';
import {
  BufferAttribute, BufferGeometry, CanvasTexture, CylinderGeometry, DoubleSide, Matrix4,
  MeshBasicMaterial, MeshStandardMaterial, Quaternion, RepeatWrapping, SRGBColorSpace, Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const sectors = 16;
const rings = [
  { radius: 4.02, y: 2.48 },
  { radius: 3.72, y: 3.6 },
  { radius: 2.78, y: 4.75 },
  { radius: 1.34, y: 5.62 },
];
const frame = new MeshStandardMaterial({ color: '#242341', roughness: 0.76, metalness: 0.1 });

function random(seed: number) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function starTexture(seed: number, base: string, nebula: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable for star panels');
  const rand = random(seed);
  context.fillStyle = base;
  context.fillRect(0, 0, 256, 256);
  for (let index = 0; index < 5; index++) {
    const x = 32 + rand() * 192;
    const y = 32 + rand() * 192;
    const radius = 42 + rand() * 55;
    const haze = context.createRadialGradient(x, y, 0, x, y, radius);
    haze.addColorStop(0, nebula);
    haze.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = haze;
    context.fillRect(0, 0, 256, 256);
  }
  for (let index = 0; index < 150; index++) {
    const x = rand() * 256;
    const y = rand() * 256;
    const radius = index % 17 === 0 ? 1.7 : 0.35 + rand() * 0.65;
    context.fillStyle = index % 9 === 0 ? '#9EEBFF' : `rgba(249, 239, 255, ${0.48 + rand() * 0.5})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function lowerWallGeometry() {
  // Match the dome's 270-degree shell, but keep the wall one smooth surface.
  const start = 3 * Math.PI / 4;
  const sweep = 3 * Math.PI / 2;
  const segments = 96;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let index = 0; index <= segments; index++) {
    const angle = start + sweep * index / segments;
    const x = Math.cos(angle) * rings[0].radius;
    const z = Math.sin(angle) * rings[0].radius;
    positions.push(x, 0, z, x, rings[0].y, z);
    const u = index / segments * 12;
    uvs.push(u, 0, u, 1);
    if (index < segments) {
      const lower = index * 2;
      indices.push(lower, lower + 1, lower + 2, lower + 1, lower + 3, lower + 2);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function tileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable for wall tiles');
  context.fillStyle = '#1D2548';
  context.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 4; row++) for (let column = 0; column < 4; column++) {
    context.fillStyle = ['#555281', '#4C517D', '#62658B', '#4B4875'][(row * 3 + column) % 4];
    context.fillRect(column * 64 + 3, row * 64 + 3, 58, 58);
    context.fillStyle = 'rgba(191, 180, 212, 0.1)';
    context.fillRect(column * 64 + 4, row * 64 + 4, 56, 4);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  return texture;
}

function domeGeometry() {
  const vertices = rings.flatMap(({ radius, y }) => Array.from({ length: sectors }, (_, index) => {
    const angle = index * Math.PI * 2 / sectors;
    return new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  }));
  vertices.push(new Vector3(0, 6.02, 0));
  const triangles: [number, number, number, number][] = [];
  const edgeKeys = new Set<string>();
  const edgePairs: [number, number][] = [];
  const addTriangle = (a: number, b: number, c: number, palette: number) => {
    triangles.push([a, b, c, palette]);
    for (const [start, end] of [[a, b], [b, c], [c, a]]) {
      const key = `${Math.min(start, end)}:${Math.max(start, end)}`;
      if (!edgeKeys.has(key)) { edgeKeys.add(key); edgePairs.push([start, end]); }
    }
  };
  for (let sector = 0; sector < sectors; sector++) {
    const middle = (sector + 0.5) * Math.PI * 2 / sectors;
    // The front aperture is the only cutaway: the camera looks through it.
    if (Math.sin(middle) > 0.72) continue;
    const next = (sector + 1) % sectors;
    for (let band = 0; band < rings.length - 1; band++) {
      const a = band * sectors + sector;
      const b = band * sectors + next;
      const c = (band + 1) * sectors + sector;
      const d = (band + 1) * sectors + next;
      addTriangle(a, b, c, (sector + band) % 3);
      addTriangle(b, d, c, (sector + band + 1) % 3);
    }
    addTriangle(3 * sectors + sector, 3 * sectors + next, 4 * sectors, (sector + 2) % 3);
  }
  const panels = [0, 1, 2].map((palette) => {
    const positions: number[] = [];
    const uvs: number[] = [];
    for (const [a, b, c, variant] of triangles) {
      if (variant !== palette) continue;
      const center = vertices[a].clone().add(vertices[b]).add(vertices[c]).multiplyScalar(1 / 3);
      for (const index of [a, b, c]) {
        const point = vertices[index].clone().lerp(center, 0.012);
        positions.push(point.x, point.y, point.z);
      }
      uvs.push(0.05, 0.07, 0.95, 0.07, 0.5, 0.96);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    geometry.computeVertexNormals();
    return geometry;
  });
  const ribs = mergeGeometries(edgePairs.map(([a, b]) => {
    const start = vertices[a];
    const end = vertices[b];
    const direction = end.clone().sub(start);
    const geometry = new CylinderGeometry(0.045, 0.045, direction.length(), 5);
    const rotation = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize());
    geometry.applyMatrix4(new Matrix4().compose(start.clone().add(end).multiplyScalar(0.5), rotation, new Vector3(1, 1, 1)));
    return geometry;
  }), false);
  if (!ribs) throw new Error('Could not build observatory dome ribs');
  return { panels, ribs };
}

export function InteriorStarDome() {
  const geometry = useMemo(domeGeometry, []);
  const wallGeometry = useMemo(lowerWallGeometry, []);
  const materials = useMemo(() => [
    starTexture(17, '#211445', 'rgba(159, 67, 185, 0.42)'),
    starTexture(41, '#172D60', 'rgba(75, 130, 228, 0.44)'),
    starTexture(73, '#144158', 'rgba(70, 206, 213, 0.34)'),
  ].map((map) => new MeshBasicMaterial({ map, side: DoubleSide, toneMapped: false })), []);
  const wallMaterial = useMemo(() => new MeshStandardMaterial({ map: tileTexture(), roughness: 0.9, side: DoubleSide }), []);
  return <group name="InteriorStarDome">
    <group name="StarPanels">
      {geometry.panels.map((panel, index) => <mesh key={panel.uuid} geometry={panel} material={materials[index]} />)}
    </group>
    <mesh name="DomeRibs" geometry={geometry.ribs} material={frame} castShadow />
    <mesh name="TiledLowerWall" geometry={wallGeometry} material={wallMaterial} receiveShadow />
  </group>;
}
