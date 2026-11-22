import { useEffect, useLayoutEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import type { Group } from 'three';
import { moveOnGround, observatoryBounds, observatoryObstacles, townBounds, townObstacles } from './collision';
import type { Point } from './collision';
import type { SceneId } from './interactions';
import { paint } from './palette';
import { useInput } from './useInput';

const finish = (color: string, roughness = 0.84) => new MeshStandardMaterial({ color, roughness, metalness: 0 });
const cloth = finish(paint.roof);
const clothShade = finish('#52406F');
const skin = finish(paint.cream, 0.8);
const boots = finish(paint.blue, 0.82);
const hat = finish('#202E44', 0.78);
const gold = finish(paint.gold, 0.69);
const eyes = finish('#283247', 0.8);

export function Player({ position, spawn, scene, enabled }: { position: MutableRefObject<Point>; spawn: Point; scene: SceneId; enabled: boolean }) {
  const model = useRef<Group>(null);
  const body = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftFoot = useRef<Group>(null);
  const rightFoot = useRef<Group>(null);
  const stride = useRef(0);
  const keys = useInput(enabled);
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (!import.meta.env.DEV && !new URLSearchParams(window.location.search).has('diagnostics')) return;
    (window as Window & { __twilightPlayerPosition?: MutableRefObject<Point> }).__twilightPlayerPosition = position;
    return () => { delete (window as Window & { __twilightPlayerPosition?: MutableRefObject<Point> }).__twilightPlayerPosition; };
  }, [position]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reducedMotion.current = query.matches; };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Changing scenes must reset the player even when a spawn coordinate is reused.
  useLayoutEffect(() => {
    position.current = { ...spawn };
    model.current?.position.set(spawn.x, 0, spawn.z);
    if (model.current) model.current.rotation.y = 0;
    stride.current = 0;
  }, [position, spawn, scene]);

  useFrame((_, delta) => {
    const held = keys.current;
    const input = enabled ? {
      x: Number(held.right) - Number(held.left),
      z: Number(held.down) - Number(held.up),
    } : { x: 0, z: 0 };
    const walking = Boolean(input.x || input.z);
    if (enabled) {
      const obstacles = scene === 'town' ? townObstacles : observatoryObstacles;
      const bounds = scene === 'town' ? townBounds : observatoryBounds;
      position.current = moveOnGround(position.current, input, delta, obstacles, bounds);
    }
    if (!model.current) return;
    model.current.position.set(position.current.x, 0, position.current.z);
    if (walking) model.current.rotation.y = Math.atan2(input.x, input.z);
    if (walking && !reducedMotion.current) stride.current += Math.min(delta, 0.033) * 9;
    const step = walking && !reducedMotion.current ? Math.sin(stride.current) : 0;
    if (body.current) body.current.position.y = walking && !reducedMotion.current ? Math.abs(step) * 0.045 : 0;
    if (leftArm.current) leftArm.current.rotation.x = step * 0.3;
    if (rightArm.current) rightArm.current.rotation.x = -step * 0.3;
    if (leftFoot.current) leftFoot.current.position.z = step * 0.075;
    if (rightFoot.current) rightFoot.current.position.z = -step * 0.075;
  });

  return <group ref={model} position={[spawn.x, 0, spawn.z]}><group ref={body}>
    {[-1, 1].map((side) => <group key={side} ref={side < 0 ? leftFoot : rightFoot} position={[side * 0.16, 0.13, 0.035]}>
      <mesh material={boots} castShadow><capsuleGeometry args={[0.115, 0.11, 3, 10]} /></mesh>
      <mesh material={boots} position={[0, -0.06, 0.07]} scale={[0.12, 0.085, 0.2]} castShadow><sphereGeometry args={[1, 10, 8]} /></mesh>
    </group>)}
    <mesh material={clothShade} position={[0, 0.45, -0.08]} castShadow><coneGeometry args={[0.36, 0.78, 12]} /></mesh>
    <mesh material={cloth} position={[0, 0.48, 0.02]} castShadow><cylinderGeometry args={[0.22, 0.32, 0.72, 12]} /></mesh>
    <mesh material={cloth} position={[0, 0.77, 0]} scale={[0.31, 0.24, 0.25]} castShadow><sphereGeometry args={[1, 14, 10]} /></mesh>
    {[-1, 1].map((side) => <group key={side} ref={side < 0 ? leftArm : rightArm} position={[side * 0.31, 0.73, 0]} rotation={[0, 0, side * 0.18]}>
      <mesh material={cloth} position={[0, -0.13, 0]} castShadow><capsuleGeometry args={[0.105, 0.23, 3, 10]} /></mesh>
      <mesh material={skin} position={[0, -0.36, 0.025]} castShadow><sphereGeometry args={[0.125, 12, 10]} /></mesh>
    </group>)}
    <mesh material={skin} position={[0, 1.08, 0.015]} scale={[0.38, 0.39, 0.36]} castShadow><sphereGeometry args={[1, 20, 14]} /></mesh>
    <mesh material={skin} position={[0, 0.99, 0.36]} scale={[0.12, 0.09, 0.06]}><sphereGeometry args={[1, 10, 8]} /></mesh>
    {[-1, 1].map((side) => <group key={side} position={[side * 0.15, 1.13, 0.344]}>
      <mesh material={eyes} scale={[0.043, 0.065, 0.02]}><sphereGeometry args={[1, 10, 8]} /></mesh>
      <mesh material={skin} position={[-0.012, 0.025, 0.018]} scale={[0.013, 0.019, 0.008]}><sphereGeometry args={[1, 8, 6]} /></mesh>
    </group>)}
    <mesh material={hat} position={[0, 1.32, 0]} castShadow><cylinderGeometry args={[0.44, 0.44, 0.12, 18]} /></mesh>
    <mesh material={hat} position={[0, 1.58, 0]} castShadow><coneGeometry args={[0.37, 0.62, 12]} /></mesh>
    <mesh material={clothShade} position={[0, 1.4, 0]} castShadow><cylinderGeometry args={[0.345, 0.37, 0.08, 12]} /></mesh>
    <mesh material={gold} position={[0, 1.4, 0.354]} scale={[0.075, 0.065, 0.022]}><sphereGeometry args={[1, 10, 8]} /></mesh>
  </group></group>;
}
