import { BoxGeometry, CylinderGeometry, MeshStandardMaterial, SphereGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { paint } from './palette';

type Position = [number, number, number];

// Shared resources let the export kit merge each finish into a few static meshes.
const canopy = new SphereGeometry(1, 12, 9);
const trunk = new CylinderGeometry(0.15, 0.21, 1, 10);
const stone = new CylinderGeometry(1, 1.08, 0.13, 12);
const flower = new SphereGeometry(1, 8, 6);
const softEdge = new RoundedBoxGeometry(1, 1, 1, 2, 0.12);
const box = new BoxGeometry(1, 1, 1);
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
  blueFlower: finish('#789FC2', 0.82),
  blue: finish(paint.blue),
  steel: finish(paint.steel),
};

// Authored variants keep each tree deterministic while changing silhouette and branching.
export function Tree({ position, scale = 1, variant = 0 }: { position: Position; scale?: number; variant?: number }) {
  const lean = ((variant * 7) % 5 - 2) * 0.08;
  return <group position={position} rotation={[0, variant * 0.71, 0]}
    scale={[scale * (0.92 + variant % 3 * 0.09), scale * (0.9 + variant % 4 * 0.06), scale]}>
    <mesh geometry={stone} material={material.earth} position={[0, 0.015, 0]} scale={[0.52, 0.23, 0.48]} receiveShadow />
    <mesh geometry={trunk} material={material.bark} position={[lean * 0.3, 0.62, 0]} rotation={[0, 0, -lean]} scale={[1, 1.24, 1]} castShadow />
    <mesh geometry={trunk} material={material.bark} position={[-0.23, 1.09, 0]} rotation={[0, 0, -0.63 - lean]} scale={[0.55, 0.72, 0.55]} castShadow />
    <mesh geometry={trunk} material={material.bark} position={[0.2, 1.13, -0.06]} rotation={[0, 0, 0.58]} scale={[0.48, 0.66, 0.48]} castShadow />
    <mesh geometry={canopy} material={material.leaf} position={[lean, 1.62, 0]} scale={[0.94, 0.72, 0.81]} castShadow />
    <mesh geometry={canopy} material={material.leafDark} position={[-0.38 + lean, 1.55, 0.08]} scale={[0.59, 0.58, 0.63]} castShadow />
    <mesh geometry={canopy} material={material.leafLight} position={[0.39 + lean, 1.58, -0.05]} scale={[0.61, 0.59, 0.61]} castShadow />
    <mesh geometry={canopy} material={material.leaf} position={[lean - 0.07, 1.93, -0.05]} scale={[0.67, 0.49, 0.61]} castShadow />
  </group>;
}

export function GardenPatch({ position, size = 1, cool = false }: { position: Position; size?: number; cool?: boolean }) {
  return <group position={position} scale={size}>
    <mesh geometry={stone} material={material.earth} position={[0, 0.055, 0]} scale={[0.86, 0.35, 0.53]} receiveShadow />
    <mesh geometry={stone} material={material.earth} position={[0, 0.085, 0]} scale={[0.74, 0.35, 0.43]} />
    {[-0.55, 0.55].map((x) => <mesh key={x} geometry={softEdge} material={material.cream}
      position={[x, 0.12, 0]} scale={[0.2, 0.13, 0.86]} castShadow />)}
    {[-0.3, 0, 0.32].map((x, index) => <group key={x} position={[x, 0, index === 1 ? -0.12 : 0.12]}>
      <mesh geometry={canopy} material={index === 1 ? material.leafLight : material.leafDark}
        position={[0, 0.25, 0]} scale={[0.24, 0.21, 0.22]} castShadow />
      <mesh geometry={flower} material={cool ? (index === 1 ? material.lavender : material.blueFlower) : (index === 1 ? material.lavender : material.gold)}
        position={[0, 0.39, 0]} scale={[0.09, 0.085, 0.09]} />
    </group>)}
  </group>;
}

export function Shrub({ position, scale = 1, dark = false }: { position: Position; scale?: number; dark?: boolean }) {
  return <group position={position} scale={scale}>
    <mesh geometry={canopy} material={material.leafDark} position={[-0.2, 0.22, 0]} scale={[0.35, 0.25, 0.33]} castShadow />
    <mesh geometry={canopy} material={dark ? material.leaf : material.leafLight} position={[0.18, 0.26, -0.07]} scale={[0.38, 0.28, 0.34]} castShadow />
    <mesh geometry={canopy} material={dark ? material.leafDark : material.leaf} position={[0.03, 0.34, 0.17]} scale={[0.31, 0.25, 0.29]} castShadow />
  </group>;
}

function FlowerSprig({ position, cool = true, alternate = false }: { position: Position; cool?: boolean; alternate?: boolean }) {
  return <group position={position}>
    <mesh geometry={canopy} material={material.leafDark} position={[0, 0.15, 0]} scale={[0.14, 0.16, 0.14]} castShadow />
    <mesh geometry={flower} material={cool ? (alternate ? material.lavender : material.blueFlower) : material.gold}
      position={[0, 0.3, 0]} scale={[0.105, 0.08, 0.105]} />
    <mesh geometry={flower} material={cool ? (alternate ? material.lavender : material.blueFlower) : material.gold}
      position={[0.1, 0.22, 0.03]} scale={[0.07, 0.07, 0.07]} />
  </group>;
}

export function ObservatoryGarden() {
  return <group>
    <Tree position={[-11.35, 0, -6.9]} scale={0.82} variant={4} />
    <Shrub position={[-11.85, 0, -5.35]} scale={0.9} dark />
    <Shrub position={[-10.55, 0, -8.45]} scale={0.9} dark />
    <Shrub position={[-7.8, 0, -9.25]} scale={0.72} dark />
    <GardenPatch position={[-11.3, 0, -4.42]} size={0.93} cool />
    <GardenPatch position={[-9.45, 0, -9.34]} size={1.13} cool />
    {([[-12, -7.5], [-10.2, -7.9], [-10.6, -4.8], [-8.25, -9.36], [-6.8, -8.95]] as [number, number][]).map(([x, z], index) =>
      <FlowerSprig key={`${x}-${z}`} position={[x, 0, z]} alternate={index % 2 === 1} />)}
  </group>;
}

export function PlazaBorders() {
  // Broken planting bands follow the outside of the paving, away from the four paths.
  const bands: Array<[number, number, number, number]> = [
    [-4.48, 4.35, -0.33, 2.2], [4.47, 4.65, 0.4, 1.9],
    [-4.45, -0.95, 0.35, 1.4], [4.43, -1.35, -0.32, 1.2],
  ];
  return <group>{bands.map(([x, z, angle, length], groupIndex) =>
    <group key={`${x}-${z}`} position={[x, 0, z]} rotation={[0, angle, 0]}>
      <mesh geometry={softEdge} material={material.earth} position={[0, 0.06, 0]} scale={[0.48, 0.1, length]} receiveShadow />
      {(['near', 'middle-near', 'middle-far', 'far'] as const).map((id, index) => <group key={id} position={[index % 2 ? -0.07 : 0.08, 0, (index - 1.5) * length / 4]}>
        <Shrub position={[0, 0, 0]} scale={0.36 + (index + groupIndex) % 3 * 0.07} />
        {index % 2 === 0 && <FlowerSprig position={[0.08, 0, 0.08]} alternate={groupIndex % 2 === 0} />}
      </group>)}
    </group>)}</group>;
}

export function SouthernPlanting() {
  return <group>
    <GardenPatch position={[-3.2, 0, 8.5]} size={0.82} cool />
    <Shrub position={[-4.05, 0, 9.1]} scale={0.72} />
    <FlowerSprig position={[-3.65, 0, 9.65]} alternate />
    <Shrub position={[3.4, 0, 8.7]} scale={0.75} />
    <GardenPatch position={[4.28, 0, 9.3]} size={0.8} />
    <FlowerSprig position={[3.75, 0, 9.65]} />
  </group>;
}

export function Bench({ position }: { position: Position }) {
  return <group position={position}>
    {[-0.55, 0.55].map((x) => <mesh key={x} geometry={box} material={material.blue} position={[x, 0.29, 0]} scale={[0.11, 0.57, 0.53]} castShadow />)}
    <mesh geometry={softEdge} material={material.steel} position={[0, 0.56, 0]} scale={[1.48, 0.14, 0.6]} castShadow />
    <mesh geometry={softEdge} material={material.blue} position={[0, 0.96, -0.27]} scale={[1.48, 0.67, 0.14]} castShadow />
    <mesh geometry={softEdge} material={material.cream} position={[0, 0.65, 0.02]} scale={[1.32, 0.035, 0.48]} />
  </group>;
}
