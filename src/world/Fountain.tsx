import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ExtrudeGeometry, MeshStandardMaterial, Shape, Vector2 } from 'three';
import type { Group } from 'three';
import { paint } from './palette';

export const fountainPosition: [number, number, number] = [0, 0, 1.35];
export const plazaPlanterOffsets = [
  [-3.3, -2.05], [3.3, -2.05], [-3.3, 2.05], [3.3, 2.05],
] as const;

const stone = new MeshStandardMaterial({ color: paint.cream, roughness: 0.85 });
const weathered = new MeshStandardMaterial({ color: paint.stoneShade, roughness: 0.94 });
const blue = new MeshStandardMaterial({ color: paint.blue, roughness: 0.8 });
const gold = new MeshStandardMaterial({ color: paint.gold, roughness: 0.7, metalness: 0.08 });
const leaf = new MeshStandardMaterial({ color: paint.evergreen, roughness: 0.9 });
const crestStone = new MeshStandardMaterial({ color: paint.steel, roughness: 0.82, metalness: 0.04 });

function carvedShape(points: [number, number][]) {
  return new ExtrudeGeometry(new Shape(points.map(([x, y]) => new Vector2(x, y))), {
    depth: 0.1, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.018, bevelSegments: 2,
  });
}

const wingOutline: [number, number][] = [
  [0.09, 0.3], [0.3, 0.43], [0.48, 0.42], [0.58, 0.55], [0.86, 0.68],
  [0.81, 0.4], [0.69, 0.34], [0.76, 0.21], [0.57, 0.25], [0.61, 0.12],
  [0.38, 0.19], [0.17, 0.16],
];
const rightWing = carvedShape(wingOutline);
const leftWing = carvedShape(wingOutline.map(([x, y]): [number, number] => [-x, y]).reverse());
const crestBody = carvedShape([
  [-0.16, 0.25], [0, 0.12], [0.16, 0.25], [0.13, 0.49], [0, 0.56], [-0.13, 0.49],
]);
const crestTriangle = carvedShape([[-0.15, -0.12], [0.15, -0.12], [0, 0.15]]);

function FountainCrest() {
  return <group name="FountainCrest" position={[0, 1.62, 0]} scale={[1.18, 1.12, 1]}>
    <mesh position={[0, 0.07, 0]} material={weathered} castShadow>
      <cylinderGeometry args={[0.13, 0.17, 0.3, 10]} />
    </mesh>
    <mesh geometry={leftWing} material={crestStone} castShadow />
    <mesh geometry={rightWing} material={crestStone} castShadow />
    <mesh geometry={crestBody} material={weathered} position={[0, 0, 0.03]} castShadow />
    {[[0, 0.78], [-0.16, 0.5], [0.16, 0.5]].map(([x, y]) =>
      <mesh key={`${x}-${y}`} geometry={crestTriangle} material={gold} position={[x, y, 0.11]} castShadow />)}
  </group>;
}

function PlazaPlanter({ x, z }: { x: number; z: number }) {
  return <group position={[x, 0, z]}>
    <mesh position={[0, 0.22, 0]} material={weathered} castShadow>
      <cylinderGeometry args={[0.35, 0.4, 0.42, 12]} />
    </mesh>
    <mesh position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0]} material={stone}><torusGeometry args={[0.35, 0.065, 6, 16]} /></mesh>
    {[-0.17, 0.17].map((offset) => <group key={offset} position={[offset, 0, 0]}>
      <mesh position={[0, 0.56, 0]} material={leaf} castShadow><sphereGeometry args={[0.2, 10, 8]} /></mesh>
      <mesh position={[0, 0.73, 0.06]} material={gold}><sphereGeometry args={[0.095, 8, 6]} /></mesh>
    </group>)}
  </group>;
}

export function Fountain() {
  return <group name="Fountain" position={fountainPosition}>
    <mesh position={[0, 0.28, 0]} material={weathered} castShadow>
      <cylinderGeometry args={[1.25, 1.31, 0.52, 32]} />
    </mesh>
    <mesh position={[0, 0.53, 0]} material={blue}>
      <cylinderGeometry args={[1.08, 1.08, 0.08, 32]} />
    </mesh>
    {Array.from({ length: 20 }, (_, index) => ({ angle: index * Math.PI * 2 / 20, accent: index % 5 === 0 })).map(({ angle, accent }) => {
      const arc = Math.PI * 2 / 20;
      return <group key={angle} rotation={[0, angle, 0]}>
        <mesh position={[0, 0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}
          material={accent ? stone : weathered} castShadow>
          <torusGeometry args={[1.17, 0.14, 6, 8, arc * 0.97]} />
        </mesh>
      </group>;
    })}
    <mesh position={[0, 0.22, 0]} material={stone}>
      <cylinderGeometry args={[1.43, 1.48, 0.2, 32]} />
    </mesh>
    <mesh position={[0, 0.84, 0]} material={weathered} castShadow>
      <cylinderGeometry args={[0.23, 0.36, 0.66, 12]} />
    </mesh>
    <mesh position={[0, 1.23, 0]} material={stone} castShadow>
      <cylinderGeometry args={[0.49, 0.33, 0.26, 16]} />
    </mesh>
    <mesh position={[0, 1.42, 0]} rotation={[-Math.PI / 2, 0, 0]} material={weathered}>
      <torusGeometry args={[0.46, 0.09, 6, 24]} />
    </mesh>
    <FountainCrest />
    {plazaPlanterOffsets.map(([x, z]) => <PlazaPlanter key={`${x}-${z}`} x={x} z={z} />)}
  </group>;
}

// Both water levels, streams, and ripples stay live outside the static GLB.
export function FountainWater() {
  const ripples = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ripples.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.7) * 0.045;
    ripples.current.scale.set(pulse, 1, pulse);
  });
  return <group name="FountainWater" position={fountainPosition}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.575, 0]}>
      <circleGeometry args={[1.05, 32]} />
      <meshStandardMaterial color="#4789A8" emissive="#215377" emissiveIntensity={0.18}
        transparent opacity={0.86} roughness={0.38} metalness={0.05} depthWrite={false} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.43, 0]}>
      <circleGeometry args={[0.41, 20]} />
      <meshStandardMaterial color="#75B0CA" transparent opacity={0.78} roughness={0.36} depthWrite={false} />
    </mesh>
    {[[0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]].map(([x, z]) =>
      <mesh key={`${x}-${z}`} position={[x, 0.98, z]}>
        <cylinderGeometry args={[0.026, 0.035, 0.76, 6]} />
        <meshStandardMaterial color="#75B0CA" transparent opacity={0.65} roughness={0.3} depthWrite={false} />
      </mesh>)}
    <group ref={ripples}>
      {[0.63, 0.91].map((radius) => <mesh key={radius} position={[0, 0.595, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.018, 4, 32]} />
        <meshStandardMaterial color="#B7D9E4" transparent opacity={0.42} depthWrite={false} />
      </mesh>)}
    </group>
  </group>;
}
