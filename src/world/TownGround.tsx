import { useMemo } from 'react';
import { CircleGeometry, Color, Float32BufferAttribute, MeshStandardMaterial } from 'three';
import { northLookout } from './collision';
import { paint } from './palette';

type Point = [number, number];
type Route = { points: Point[]; width: number };

// All courses sit over a single, flat ground plane. The narrow dark bed shows
// through the fitted gaps as mortar; none of this geometry affects collision.
const mortar = new MeshStandardMaterial({ color: '#CEC4B5', roughness: 1 });
const stones = ['#F3EBDD', '#ECE3D5', '#E5DCCD'].map((color) => new MeshStandardMaterial({ color, roughness: 0.97 }));
const edging = new MeshStandardMaterial({ color: paint.stoneShade, roughness: 1 });
const grassMaterial = new MeshStandardMaterial({ vertexColors: true, roughness: 1 });

const routes: Route[] = [
  { points: [[-3.2, 0], [-5.15, -2.65], [-7.1, -3.25], [-8.3, -3.4]], width: 1.25 },
  { points: [[-5.15, -2.65], [-4.25, -6.25], [northLookout.x, northLookout.z + 1.75]], width: 1.2 },
  { points: [[-4, 2], [-6.2, 2]], width: 1.2 },
  { points: [[3.6, 1.2], [5.2, -0.2]], width: 1.45 },
  { points: [[3.6, 2.3], [7.1, 4.1]], width: 1.18 },
  { points: [[0, 5.0], [0, 10.4]], width: 2.1 },
];

function RouteStones() {
  const strips = routes.flatMap((route, routeIndex) => route.points.slice(1).map((to, segmentIndex) => {
    const from = route.points[segmentIndex];
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    const length = Math.hypot(dx, dz);
    return { key: `${routeIndex}-${segmentIndex}`, from, to, length, angle: Math.atan2(dx, dz), width: route.width,
      pieces: Math.max(1, Math.round(length / 0.72)), routeIndex, segmentIndex };
  }));
  const junctions = [
    { point: [-5.15, -2.65] as Point, radius: 0.92 },
    { point: [-7.1, -3.25] as Point, radius: 0.69 },
    { point: [-4.25, -6.25] as Point, radius: 0.68 },
  ];
  return <group name="TownPaths">
    {strips.map((strip) => <group key={strip.key} position={[(strip.from[0] + strip.to[0]) / 2, 0, (strip.from[1] + strip.to[1]) / 2]} rotation={[0, strip.angle, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.048, 0]} receiveShadow>
        <planeGeometry args={[strip.width, strip.length + 0.025]} /><primitive object={mortar} attach="material" />
      </mesh>
      {(strip.routeIndex === 5 || (strip.routeIndex === 0 && strip.segmentIndex === 2)) && [-1, 1].map((side) =>
        <mesh key={side} rotation={[-Math.PI / 2, 0, 0]} position={[side * (strip.width / 2 + 0.025), 0.055, 0]} receiveShadow>
          <planeGeometry args={[0.09, strip.length]} /><primitive object={edging} attach="material" />
        </mesh>)}
      {Array.from({ length: strip.pieces }, (_, index) => {
        const step = strip.length / strip.pieces;
        const z = -strip.length / 2 + step * (index + 0.5);
        const nearJunction = (strip.routeIndex === 0 && (strip.segmentIndex === 0 || strip.segmentIndex === 1)) || strip.routeIndex === 1;
        const excluded = nearJunction && ((strip.segmentIndex === 0 && index === strip.pieces - 1) || (strip.segmentIndex > 0 && index === 0));
        if (excluded) return null;
        const edge = index % 2 === 0 ? 0.065 : 0.1;
        return <mesh key={`${strip.key}-${z.toFixed(3)}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.052, z]} receiveShadow>
          <planeGeometry args={[strip.width - edge, step - 0.065]} />
          <primitive object={stones[(index + strip.routeIndex * 2 + strip.segmentIndex) % stones.length]} attach="material" />
        </mesh>;
      })}
    </group>)}
    {junctions.map(({ point, radius }, index) => <group key={point.join(',')} position={[point[0], 0, point[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <circleGeometry args={[radius, 18]} /><primitive object={mortar} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.054, 0]} receiveShadow>
        <circleGeometry args={[radius - 0.075, 18]} /><primitive object={stones[index % stones.length]} attach="material" />
      </mesh>
    </group>)}
  </group>;
}

export function PlazaPaving() {
  const rows = [
    { inner: 1.66, outer: 2.22, count: 18, offset: 0 },
    { inner: 2.27, outer: 2.84, count: 22, offset: 0.5 },
    { inner: 2.89, outer: 3.47, count: 26, offset: 0 },
    { inner: 3.52, outer: 4.12, count: 30, offset: 0.5 },
  ];
  return <group name="PlazaPaving" position={[0, 0, 1.35]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} receiveShadow>
      <circleGeometry args={[4.3, 80]} /><primitive object={mortar} attach="material" />
    </mesh>
    {rows.flatMap((row, rowIndex) => Array.from({ length: row.count }, (_, section) => {
      const arc = Math.PI * 2 / row.count;
      const start = (section + row.offset) * arc + 0.012;
      return <mesh key={`${row.inner}-${start.toFixed(4)}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.086, 0]} receiveShadow>
        <ringGeometry args={[row.inner, row.outer, 3, 1, start, arc - 0.024]} />
        <primitive object={stones[(section * 7 + rowIndex * 2) % stones.length]} attach="material" />
      </mesh>;
    }))}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.088, 0]} receiveShadow>
      <ringGeometry args={[4.19, 4.27, 80]} /><primitive object={stones[0]} attach="material" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.088, 0]} receiveShadow>
      <ringGeometry args={[1.56, 1.62, 48]} /><primitive object={stones[0]} attach="material" />
    </mesh>
  </group>;
}

const grassPatches: [number, number, number, number, string][] = [
  [-8.7, 4.8, 3.8, 2.3, '#718060'], [-2.5, 7.4, 3.7, 2.8, '#617251'],
  [7.8, 8.4, 4.8, 2.8, '#71805F'], [9.3, -6.1, 3.9, 2.9, '#617351'],
  [-9.7, -8.5, 4.2, 3.0, '#718060'], [1.9, -9.2, 4.9, 3.4, '#627251'],
  [-6.5, -1.5, 1.6, 1.15, '#8A8667'], [5.4, 0.8, 1.7, 1.1, '#888467'],
  [7.0, 4.6, 1.45, 1.0, '#8A8567'], [0, 6.1, 2.2, 1.2, '#858365'],
];

export function GrassVariation() {
  const geometry = useMemo(() => grassPatches.map((patch) => {
    const circle = new CircleGeometry(1, 32);
    const center = new Color(patch[4]);
    const outer = new Color(paint.grass);
    const colors = [center.r, center.g, center.b];
    for (let i = 0; i < 33; i++) colors.push(outer.r, outer.g, outer.b);
    circle.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return circle;
  }), []);
  return <group name="GrassVariation">
    {grassPatches.map(([x, z, width, depth], index) => <mesh key={`${x},${z}`} geometry={geometry[index]}
      rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012, z]} scale={[width, depth, 1]} receiveShadow>
      <primitive object={grassMaterial} attach="material" />
    </mesh>)}
  </group>;
}

export function TownGround() {
  return <>
    <GrassVariation />
    <RouteStones />
    <PlazaPaving />
  </>;
}
