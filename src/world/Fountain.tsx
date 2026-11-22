import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { paint } from './palette';

export const fountainPosition: [number, number, number] = [-2.3, 0, 1.25];

export function Fountain() {
  return <group name="Fountain" position={fountainPosition}>
    <mesh position={[0, 0.3, 0]} castShadow><cylinderGeometry args={[0.82, 0.88, 0.5, 16]} /><meshStandardMaterial color={paint.stoneShade} roughness={1} /></mesh>
    <mesh position={[0, 0.58, 0]} castShadow><torusGeometry args={[0.7, 0.13, 8, 24]} /><meshStandardMaterial color={paint.cream} roughness={1} /></mesh>
    <mesh position={[0, 0.85, 0]} castShadow><cylinderGeometry args={[0.18, 0.25, 0.75, 8]} /><meshStandardMaterial color={paint.steel} roughness={0.8} /></mesh>
    <mesh position={[0, 1.23, 0]}><sphereGeometry args={[0.23, 10, 8]} /><meshStandardMaterial color={paint.gold} metalness={0.25} roughness={0.5} /></mesh>
  </group>;
}

// Water stays live in both source preview and normal GLB mode.
export function FountainWater() {
  const surface = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (surface.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      surface.current.position.y = 0.56 + Math.sin(clock.elapsedTime * 1.6) * 0.012;
    }
  });
  return <group name="FountainWater" position={fountainPosition}>
    <mesh ref={surface} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.56, 0]}>
      <circleGeometry args={[0.66, 24]} />
      <meshStandardMaterial color="#4789A8" emissive="#215377" emissiveIntensity={0.28} transparent opacity={0.8} roughness={0.35} metalness={0.15} depthWrite={false} />
    </mesh>
  </group>;
}
