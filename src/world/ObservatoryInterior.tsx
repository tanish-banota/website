import { useLayoutEffect, useRef } from 'react';
import { DoubleSide } from 'three';
import type { Group } from 'three';
import { paint } from './palette';
const { cream, steel, blue, gold } = paint;
function Telescope() {
  return (
    <group position={[0, 0, -1.2]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.48, 1.1, 12]} />
        <meshStandardMaterial color={blue} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.43, 0]} castShadow>
        <sphereGeometry args={[0.38, 12, 8]} />
        <meshStandardMaterial color={gold} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.17, 0]}><cylinderGeometry args={[0.57, 0.62, 0.25, 12]} /><meshStandardMaterial color={steel} /></mesh>
      <mesh position={[0, 1.49, 0]}><torusGeometry args={[0.31, 0.065, 6, 16]} /><meshStandardMaterial color={blue} /></mesh>
      <mesh position={[0, 1.95, -0.34]} rotation={[-0.55, 0, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.32, 2.1, 16]} />
        <meshStandardMaterial color={steel} metalness={0.2} roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.78, -0.9]} rotation={[-0.55, 0, 0]}>
        <torusGeometry args={[0.42, 0.08, 8, 20]} />
        <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 2.92, -1.0]} rotation={[-0.55, 0, 0]}><cylinderGeometry args={[0.3, 0.3, 0.18, 16]} /><meshStandardMaterial color={blue} /></mesh>
      <mesh position={[0, 1.2, 0.62]} rotation={[-0.55, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.5, 12]} />
        <meshStandardMaterial color={blue} />
      </mesh>
    </group>
  );
}
function ExitFrame() {
  return (
    <group position={[0, 0, 3.45]}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.05, 1.12, 0]} castShadow>
          <boxGeometry args={[0.25, 2.24, 0.32]} />
          <meshStandardMaterial color={steel} />
        </mesh>
      ))}
      <mesh position={[0, 2.27, 0]} castShadow>
        <boxGeometry args={[2.35, 0.28, 0.36]} />
        <meshStandardMaterial color={blue} />
      </mesh>
      <mesh position={[0, 2.53, 0]}>
        <boxGeometry args={[0.65, 0.2, 0.38]} />
        <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.14, 0]}><boxGeometry args={[2.45, 0.28, 0.52]} /><meshStandardMaterial color={steel} /></mesh>
    </group>
  );
}

export function ObservatoryInterior() {
  const root = useRef<Group>(null);
  useLayoutEffect(() => {
    if (import.meta.env.DEV) (window as Window & { __twilightObservatoryKit?: Group }).__twilightObservatoryKit = root.current ?? undefined;
    return () => { if (import.meta.env.DEV) delete (window as Window & { __twilightObservatoryKit?: Group }).__twilightObservatoryKit; };
  }, []);
  return (
    <group ref={root} name="ObservatoryInterior">
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <cylinderGeometry args={[4.25, 4.25, 0.44, 32]} />
        <meshStandardMaterial color={blue} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[4.18, 40]} />
        <meshStandardMaterial color={cream} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}><ringGeometry args={[3.65, 4.02, 32]} /><meshStandardMaterial color={steel} /></mesh>
      {/* The back wall and roof trim are cut away on the camera-facing side. */}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.08, 4.08, 2.5, 32, 1, true, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color={steel} side={DoubleSide} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.07, 0.12, 8, 32, Math.PI]} />
        <meshStandardMaterial color={blue} />
      </mesh>
      {[-2.1, 0, 2.1].map((x) => <group key={x} position={[x, 1.55, -3.55]}>
        <mesh><boxGeometry args={[0.45, 0.7, 0.08]} /><meshStandardMaterial color={blue} /></mesh>
        <mesh position={[0, 0, 0.05]}><boxGeometry args={[0.3, 0.54, 0.025]} /><meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.35} /></mesh>
      </group>)}
      {[-2.6, 2.6].map((x) => (
        <group key={x} position={[x, 0, -2.7]}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 2.2, 8]} />
            <meshStandardMaterial color={blue} />
          </mesh>
          <mesh position={[0, 2.04, 0.24]}>
            <boxGeometry args={[0.42, 0.52, 0.42]} />
            <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
      <group name="Telescope"><Telescope /></group>
      <group name="ExitFrame"><ExitFrame /></group>
    </group>
  );
}

