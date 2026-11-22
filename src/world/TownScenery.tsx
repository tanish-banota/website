import { CylinderGeometry, MeshStandardMaterial, SphereGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { paint } from './palette';

type Position = [number, number, number];

// Shared resources let the export kit merge each finish into a few static meshes.
const canopy = new SphereGeometry(1, 16, 12);
const trunk = new CylinderGeometry(0.15, 0.21, 1, 10);
const stone = new CylinderGeometry(1, 1.08, 0.13, 12);
const flower = new SphereGeometry(1, 8, 6);
const softEdge = new RoundedBoxGeometry(1, 1, 1, 2, 0.12);
const finish = (color: string, roughness = 0.9) => new MeshStandardMaterial({ color, roughness, metalness: 0 });
const material = {
  bark: finish('#4A4B4D'),
  leafDark: finish('#385449'),
  leaf: finish(paint.evergreen, 0.86),
  leafLight: finish('#62765C', 0.84),
  leafWarm: finish('#75815E', 0.87),
  earth: finish('#53604C'),
  stone: finish(paint.stoneShade),
  cream: finish(paint.cream, 0.86),
  gold: finish(paint.gold, 0.78),
  lavender: finish('#9C82B3', 0.82),
};

const crowns: Array<[number, number, number, number, keyof Pick<typeof material, 'leafDark' | 'leaf' | 'leafLight' | 'leafWarm'>]> = [
  [0, 1.64, 0, 0.76, 'leaf'], [-0.54, 1.43, 0.13, 0.52, 'leafDark'],
  [0.53, 1.47, -0.08, 0.56, 'leafLight'], [-0.22, 1.93, -0.22, 0.54, 'leafWarm'],
  [0.26, 2.01, 0.14, 0.5, 'leaf'], [0, 1.37, 0.49, 0.43, 'leafLight'],
];

export function Tree({ position, scale = 1 }: { position: Position; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh geometry={stone} material={material.stone} position={[0, 0.075, 0]} scale={[0.48, 1, 0.48]} receiveShadow />
    <mesh geometry={trunk} material={material.bark} position={[0, 0.65, 0]} scale={[1, 1.25, 1]} castShadow />
    <mesh geometry={trunk} material={material.bark} position={[-0.25, 1.15, 0]} rotation={[0, 0, -0.6]} scale={[0.58, 0.58, 0.58]} castShadow />
    {crowns.map(([x, y, z, radius, surface]) =>
      <mesh key={`${x}-${y}-${z}`} geometry={canopy} material={material[surface]} position={[x, y, z]}
        scale={[radius, radius * 0.88, radius * 0.94]} castShadow />)}
  </group>;
}

export function GardenPatch({ position, size = 1 }: { position: Position; size?: number }) {
  return <group position={position} scale={size}>
    <mesh geometry={stone} material={material.stone} position={[0, 0.055, 0]} scale={[0.86, 0.35, 0.53]} receiveShadow />
    <mesh geometry={stone} material={material.earth} position={[0, 0.085, 0]} scale={[0.74, 0.35, 0.43]} />
    {[-0.55, 0.55].map((x) => <mesh key={x} geometry={softEdge} material={material.cream}
      position={[x, 0.12, 0]} scale={[0.2, 0.13, 0.86]} castShadow />)}
    {[-0.3, 0, 0.32].map((x, index) => <group key={x} position={[x, 0, index === 1 ? -0.12 : 0.12]}>
      <mesh geometry={canopy} material={index === 1 ? material.leafLight : material.leafDark}
        position={[0, 0.25, 0]} scale={[0.24, 0.21, 0.22]} castShadow />
      <mesh geometry={flower} material={index === 1 ? material.lavender : material.gold}
        position={[0, 0.39, 0]} scale={[0.09, 0.085, 0.09]} />
    </group>)}
  </group>;
}

export function Shrub({ position, scale = 1 }: { position: Position; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh geometry={canopy} material={material.leafDark} position={[-0.2, 0.22, 0]} scale={[0.35, 0.25, 0.33]} castShadow />
    <mesh geometry={canopy} material={material.leafLight} position={[0.18, 0.26, -0.07]} scale={[0.38, 0.28, 0.34]} castShadow />
    <mesh geometry={canopy} material={material.leaf} position={[0.03, 0.34, 0.17]} scale={[0.31, 0.25, 0.29]} castShadow />
  </group>;
}
