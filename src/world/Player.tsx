import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { moveOnGround, townBounds, townObstacles, townSpawn } from './collision';
import type { Point } from './collision';
import { useInput } from './useInput';

export function Player({ position, enabled }: { position: MutableRefObject<Point>; enabled: boolean }) {
  const model = useRef<Group>(null);
  const keys = useInput(enabled);

  useFrame((_, delta) => {
    if (!enabled) return;
    const held = keys.current;
    const input = {
      x: Number(held.right) - Number(held.left),
      z: Number(held.down) - Number(held.up),
    };
    position.current = moveOnGround(position.current, input, delta, townObstacles, townBounds);
    if (!model.current) return;
    model.current.position.set(position.current.x, 0, position.current.z);
    if (input.x || input.z) model.current.rotation.y = Math.atan2(input.x, input.z);
  });

  return (
    <group ref={model} position={[townSpawn.x, 0, townSpawn.z]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.3, 0.8, 10]} />
        <meshStandardMaterial color="#665087" roughness={1} />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <sphereGeometry args={[0.31, 12, 8]} />
        <meshStandardMaterial color="#F3EBDD" roughness={1} />
      </mesh>
      <mesh position={[0, 1.38, 0]} castShadow>
        <coneGeometry args={[0.4, 0.66, 8]} />
        <meshStandardMaterial color="#263750" roughness={1} />
      </mesh>
      <mesh position={[0, 1.05, 0.29]}>
        <sphereGeometry args={[0.075, 8, 6]} />
        <meshStandardMaterial color="#EDBC70" emissive="#EDBC70" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}
