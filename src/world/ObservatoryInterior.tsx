import { useLayoutEffect, useRef } from 'react';
import type { Group } from 'three';
import { InteriorStarDome } from './InteriorStarDome';
import { InteriorTelescope } from './InteriorTelescope';
import { paint } from './palette';

function ObservatoryFloor() {
  return <group name="ObservatoryFloor">
    <mesh position={[0, -0.23, 0]} receiveShadow>
      <cylinderGeometry args={[4.2, 4.2, 0.46, 48]} />
      <meshStandardMaterial color={paint.blue} roughness={0.94} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
      <circleGeometry args={[4.08, 48]} />
      <meshStandardMaterial color="#393A63" roughness={0.92} />
    </mesh>
    {Array.from({ length: 16 }, (_, sector) => sector * Math.PI / 8).map((angle, sector) => <mesh key={angle}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.023, 0]} receiveShadow>
      <ringGeometry args={[1.15, 3.66, 1, 1, angle + 0.015, Math.PI / 8 - 0.03]} />
      <meshStandardMaterial color={sector % 4 === 0 ? '#5A5A85' : sector % 2 ? '#41446D' : '#4A4B77'} roughness={0.91} />
    </mesh>)}
    {[1.08, 3.7, 4.03].map((radius) => <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.035, 0]}>
      <torusGeometry args={[radius, 0.035, 5, 64]} />
      <meshStandardMaterial color="#B9A06F" roughness={0.72} metalness={0.1} />
    </mesh>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
      <circleGeometry args={[1.04, 32]} />
      <meshStandardMaterial color="#283E64" roughness={0.86} />
    </mesh>
  </group>;
}

function StarDisplay() {
  return <group name="StarDisplay" position={[1.1, 0, -2]}>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.52, 0.56, 0.24, 8]} />
      <meshStandardMaterial color={paint.blue} roughness={0.85} />
    </mesh>
    <mesh position={[0, 0.7, 0]} castShadow>
      <cylinderGeometry args={[0.37, 0.48, 1.0, 8]} />
      <meshStandardMaterial color="#5B5A81" roughness={0.86} />
    </mesh>
    <mesh position={[0, 1.25, 0]} castShadow>
      <cylinderGeometry args={[0.49, 0.4, 0.14, 8]} />
      <meshStandardMaterial color="#B9A06F" roughness={0.68} metalness={0.1} />
    </mesh>
    <mesh position={[0, 1.75, 0]} rotation={[0, Math.PI / 4, 0]}>
      <octahedronGeometry args={[0.55]} />
      <meshStandardMaterial color="#72D8EC" emissive="#2C9FB9" emissiveIntensity={1.2}
        roughness={0.22} metalness={0.1} />
    </mesh>
    <mesh position={[0, 1.78, 0]} rotation={[0, Math.PI / 4, 0]}>
      <octahedronGeometry args={[0.33]} />
      <meshBasicMaterial color="#D8FFFF" toneMapped={false} />
    </mesh>
  </group>;
}

function WarmSconce({ x }: { x: number }) {
  return <group position={[x, 1.5, -2.9]}>
    <mesh castShadow>
      <boxGeometry args={[0.43, 0.78, 0.14]} />
      <meshStandardMaterial color={paint.blue} roughness={0.85} />
    </mesh>
    <mesh position={[0, 0, 0.1]}>
      <boxGeometry args={[0.27, 0.5, 0.04]} />
      <meshStandardMaterial color={paint.gold} emissive={paint.gold} emissiveIntensity={0.52} />
    </mesh>
    <mesh position={[0, 0.43, 0.05]}>
      <boxGeometry args={[0.52, 0.08, 0.22]} />
      <meshStandardMaterial color="#B9A06F" roughness={0.7} />
    </mesh>
  </group>;
}

export function ObservatoryInterior() {
  const root = useRef<Group>(null);
  useLayoutEffect(() => {
    if (import.meta.env.DEV) (window as Window & { __twilightObservatoryKit?: Group }).__twilightObservatoryKit = root.current ?? undefined;
    return () => { if (import.meta.env.DEV) delete (window as Window & { __twilightObservatoryKit?: Group }).__twilightObservatoryKit; };
  }, []);
  return <group ref={root} name="ObservatoryInterior">
    <ObservatoryFloor />
    <InteriorStarDome />
    <InteriorTelescope />
    <StarDisplay />
    <WarmSconce x={-2.75} />
    <WarmSconce x={2.75} />
  </group>;
}
