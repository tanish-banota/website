import { BoxGeometry, MeshStandardMaterial, SphereGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { paint } from './palette';

const finish = (color: string, roughness = 0.87) => new MeshStandardMaterial({ color, roughness, metalness: 0 });
const material = {
  wall: finish(paint.cream, 0.86),
  foundation: finish('#D6CBBB'),
  trim: finish('#E8DFD0', 0.82),
  shadow: finish('#373A4E'),
  door: finish(paint.blue, 0.79),
  roofBase: finish('#342B50'),
  roof: finish(paint.roof, 0.79),
  roofLight: finish('#796393', 0.77),
  roofDark: finish('#584571', 0.83),
  glass: new MeshStandardMaterial({ color: paint.gold, emissive: paint.gold, emissiveIntensity: 0.34, roughness: 0.66, metalness: 0 }),
  sign: finish(paint.steel, 0.8),
};
const body = new RoundedBoxGeometry(4.3, 3, 3.1, 3, 0.14);
const foundation = new RoundedBoxGeometry(4.52, 0.35, 3.31, 3, 0.09);
const course = new RoundedBoxGeometry(4.46, 0.16, 3.24, 2, 0.06);
const roofPanel = new RoundedBoxGeometry(2.5, 0.2, 3.48, 3, 0.08);
const tile = new RoundedBoxGeometry(0.69, 0.09, 0.51, 2, 0.035);
const ridge = new RoundedBoxGeometry(0.28, 0.21, 3.55, 3, 0.08);
const doorFrame = new RoundedBoxGeometry(1.42, 2.02, 0.2, 3, 0.16);
const door = new RoundedBoxGeometry(1.12, 1.75, 0.12, 3, 0.18);
const windowFrame = new RoundedBoxGeometry(0.82, 1.04, 0.17, 3, 0.1);
const windowRecess = new RoundedBoxGeometry(0.65, 0.87, 0.07, 3, 0.07);
const windowPane = new RoundedBoxGeometry(0.49, 0.71, 0.04, 2, 0.045);
const mullion = new BoxGeometry(0.055, 0.72, 0.055);
const sill = new RoundedBoxGeometry(0.92, 0.12, 0.27, 2, 0.05);
const knob = new SphereGeometry(0.06, 10, 8);
const signBoard = new RoundedBoxGeometry(1.7, 0.41, 0.15, 3, 0.08);

function RoofSlope({ side }: { side: -1 | 1 }) {
  return <group position={[side * 1.16, 3.36, 0]} rotation={[0, 0, -side * 0.32]}>
    <mesh geometry={roofPanel} material={material.roofBase} castShadow />
    {[-0.75, 0, 0.75].flatMap((x, column) => [-1.17, -0.585, 0, 0.585, 1.17].map((z, row) =>
      <mesh key={`${x}-${z}`} geometry={tile} position={[x, 0.145, z]}
        material={(column + row) % 6 === 0 ? material.roofLight : (column + row) % 5 === 0 ? material.roofDark : material.roof}
        castShadow />))}
  </group>;
}

function Window({ x }: { x: number }) {
  return <group position={[x, 1.83, 1.62]}>
    <mesh geometry={windowFrame} material={material.trim} castShadow />
    <mesh geometry={windowRecess} material={material.shadow} position={[0, 0, 0.105]} />
    <mesh geometry={windowPane} material={material.glass} position={[0, 0, 0.147]} />
    <mesh geometry={mullion} material={material.trim} position={[0, 0, 0.19]} />
    <mesh geometry={sill} material={material.foundation} position={[0, -0.57, 0.09]} castShadow />
  </group>;
}

// This is the existing town hall footprint; the two previously removed houses stay removed.
export function TownHall() {
  return <group position={[6.5, 0, -1.65]}>
    <mesh geometry={foundation} material={material.foundation} position={[0, 0.18, 0]} castShadow receiveShadow />
    <mesh geometry={body} material={material.wall} position={[0, 1.57, 0]} castShadow receiveShadow />
    <mesh geometry={course} material={material.trim} position={[0, 2.82, 0]} castShadow />
    <RoofSlope side={-1} /><RoofSlope side={1} />
    <mesh geometry={ridge} material={material.roofDark} position={[0, 3.78, 0]} castShadow />
    <mesh geometry={doorFrame} material={material.trim} position={[0, 1.04, 1.62]} castShadow />
    <mesh geometry={door} material={material.door} position={[0, 0.99, 1.74]} />
    <mesh geometry={knob} material={material.glass} position={[0.36, 0.97, 1.82]} />
    <Window x={-1.42} /><Window x={1.42} />
    <mesh geometry={signBoard} material={material.trim} position={[0, 2.68, 1.69]} castShadow />
    <mesh geometry={signBoard} material={material.sign} position={[0, 2.68, 1.79]} scale={[0.82, 0.54, 0.36]} />
    <mesh geometry={sill} material={material.glass} position={[0, 2.68, 1.83]} scale={[0.78, 0.68, 0.45]} />
  </group>;
}
