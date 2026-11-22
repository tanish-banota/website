import { useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { paint } from './palette';

const finish = (color: string, roughness: number) => new MeshStandardMaterial({ color, roughness, metalness: 0 });
const material = {
  stone: finish(paint.cream, 0.83),
  stoneEdge: finish('#DDD3C4', 0.9),
  roofBase: finish(paint.blue, 0.87),
  roof: finish(paint.roof, 0.75),
  roofLight: finish('#786192', 0.78),
  roofDark: finish('#594675', 0.82),
  paving: finish('#E8DFD0', 0.94),
  pavingLight: finish(paint.cream, 0.9),
  joints: finish('#A99E99', 1),
  wood: finish(paint.blue, 0.82),
  flower: finish(paint.gold, 0.65),
  foliage: finish(paint.evergreen, 0.88),
};

function SoftBox({ size, radius, position, rotation, surface, castShadow = false, receiveShadow = false, segments = 2 }: {
  size: [number, number, number]; radius: number; position: [number, number, number];
  rotation?: [number, number, number]; surface: MeshStandardMaterial; castShadow?: boolean; receiveShadow?: boolean; segments?: number;
}) {
  const geometry = useMemo(() => new RoundedBoxGeometry(...size, segments, radius), [size[0], size[1], size[2], radius, segments]);
  return <mesh geometry={geometry} material={surface} position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow} />;
}

function RoofSlope({ side }: { side: -1 | 1 }) {
  return <group position={[side * 0.59, 2.73, 0]} rotation={[0, 0, -side * 0.45]}>
    <SoftBox size={[1.45, 0.2, 2.4]} radius={0.07} position={[0, 0, 0]} surface={material.roofBase} castShadow />
    {[-0.49, 0, 0.49].flatMap((x, column) => [-0.84, -0.28, 0.28, 0.84].map((z, row) =>
      <SoftBox key={`${x}-${z}`} size={[0.44, 0.09, 0.48]} radius={0.045}
        position={[x, 0.13, z]} surface={(column + row) % 4 === 0 ? material.roofLight : (column + row) % 4 === 2 ? material.roofDark : material.roof} castShadow />))}
  </group>;
}

function FlowerPlanter() {
  return <group name="FlowerPlanter" position={[0.95, 0, 2.65]}>
    <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.54, 16]} />
      <meshStandardMaterial color="#263750" transparent opacity={0.16} depthWrite={false} />
    </mesh>
    <SoftBox size={[0.78, 0.42, 0.52]} radius={0.1} position={[0, 0.25, 0]} surface={material.stoneEdge} castShadow />
    <SoftBox size={[0.83, 0.12, 0.57]} radius={0.045} position={[0, 0.51, 0]} surface={material.stone} castShadow />
    {[-0.23, 0, 0.23].map((x, index) => <group key={x} position={[x, 0, index === 1 ? -0.06 : 0.09]}>
      <mesh position={[0, 0.69, 0]} material={material.foliage} castShadow><sphereGeometry args={[0.19, 10, 8]} /></mesh>
      <mesh position={[0, 0.84, 0]} material={material.flower}><sphereGeometry args={[0.085, 10, 8]} /></mesh>
    </group>)}
  </group>;
}

export function StyleSample() {
  return <group name="StyleSample" position={[2.95, 0, -6.2]}>
    {/* A thin, dark inset reads as contact shade without a screen-space effect. */}
    <SoftBox size={[2.46, 0.08, 2.24]} radius={0.07} position={[0, 0.03, 0]} surface={material.joints} />
    <SoftBox size={[2.2, 2.4, 2]} radius={0.12} segments={3} position={[0, 1.23, 0]} surface={material.stone} castShadow />
    {[0.36, 0.85, 1.34, 1.83, 2.24].map((y, index) =>
      <SoftBox key={y} size={[0.26, 0.36, 0.26]} radius={0.055} position={[-1.05, y, 0.94]}
        surface={index % 2 ? material.stone : material.stoneEdge} castShadow />)}
    <SoftBox size={[0.74, 1.36, 0.13]} radius={0.12} position={[-0.17, 0.77, 1.04]} surface={material.wood} />
    <SoftBox size={[0.5, 0.64, 0.08]} radius={0.11} position={[0.62, 1.52, 1.065]} surface={material.wood} />
    <SoftBox size={[0.34, 0.48, 0.09]} radius={0.08} position={[0.62, 1.52, 1.12]} surface={material.flower} />
    <RoofSlope side={-1} /><RoofSlope side={1} />
    {/* Separate pavers leave dark, consistent joints visible at gameplay zoom. */}
    <SoftBox size={[2.08, 0.045, 1.55]} radius={0.025} position={[0, 0.054, 1.95]} surface={material.joints} />
    {[-0.67, 0, 0.67].flatMap((x, column) => [1.42, 1.94, 2.46].map((z, row) =>
      <SoftBox key={`${x}-${z}`} size={[0.61, 0.065, 0.46]} radius={0.035} position={[x, 0.105, z]}
        surface={(column + row) % 3 === 0 ? material.pavingLight : material.paving} receiveShadow />))}
    <FlowerPlanter />
  </group>;
}
