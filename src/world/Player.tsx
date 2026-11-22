import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { useLayoutEffect } from 'react';
import { moveOnGround, observatoryBounds, observatoryObstacles, townBounds, townObstacles } from './collision';
import type { Point } from './collision';
import type { SceneId } from './interactions';
import { useInput } from './useInput';

export function Player({ position, spawn, scene, enabled }: { position: MutableRefObject<Point>; spawn: Point; scene: SceneId; enabled: boolean }) {
  const model = useRef<Group>(null);
  const keys = useInput(enabled);

  useLayoutEffect(() => {
    position.current = { ...spawn };
    model.current?.position.set(spawn.x, 0, spawn.z);
    if (model.current) model.current.rotation.y = 0;
  }, [position, spawn, scene]);

  useFrame((_, delta) => {
    if (!enabled) return;
    const held = keys.current;
    const input = {
      x: Number(held.right) - Number(held.left),
      z: Number(held.down) - Number(held.up),
    };
    const obstacles = scene === 'town' ? townObstacles : observatoryObstacles;
    const bounds = scene === 'town' ? townBounds : observatoryBounds;
    position.current = moveOnGround(position.current, input, delta, obstacles, bounds);
    if (!model.current) return;
    model.current.position.set(position.current.x, 0, position.current.z);
    if (input.x || input.z) model.current.rotation.y = Math.atan2(input.x, input.z);
  });

  return (
    <group ref={model} position={[spawn.x, 0, spawn.z]}>
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
