import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { AnimationMixer, Box3, Group, MeshStandardMaterial, Vector3 } from 'three';
import type { AnimationAction, AnimationClip, Object3D } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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
const characterHeight = 1.82;
const characterFile = '/models/toon_link_animated.glb';

type CharacterVisual = { object: Object3D; mixer: AnimationMixer; idle: AnimationAction; walk: AnimationAction };

function prepareCharacter(root: Object3D, clips: AnimationClip[]): CharacterVisual {
  const idleClip = clips.find((clip) => clip.name === 'Idle');
  const walkClip = clips.find((clip) => clip.name === 'Walk');
  if (!idleClip || !walkClip) throw new Error('Character model needs Idle and Walk clips');
  const mixer = new AnimationMixer(root);
  const idle = mixer.clipAction(idleClip).play();
  const walk = mixer.clipAction(walkClip).play();
  idle.setEffectiveWeight(1);
  walk.setEffectiveWeight(0);
  mixer.update(0);
  root.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(root);
  const size = bounds.getSize(new Vector3());
  if (!Number.isFinite(size.y) || size.y <= 0) throw new Error('Character model has no usable height');
  const scale = characterHeight / size.y;
  const center = bounds.getCenter(new Vector3());
  const wrapper = new Group();
  wrapper.name = 'LinkVisual';
  root.position.set(-center.x, -bounds.min.y, -center.z);
  wrapper.scale.setScalar(scale);
  wrapper.add(root);
  root.traverse((object) => {
    if (object.type !== 'SkinnedMesh') return;
    // The source has several small skinned accessories with bind-pose bounds.
    object.frustumCulled = false;
    const material = (object as Object3D & { material?: { name?: string } }).material;
    object.castShadow = ['skin', 'clothes', 'hair'].includes(material?.name ?? '');
  });
  return { object: wrapper, mixer, idle, walk };
}

export function Player({ position, spawn, scene, enabled }: { position: MutableRefObject<Point>; spawn: Point; scene: SceneId; enabled: boolean }) {
  const model = useRef<Group>(null);
  const body = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftFoot = useRef<Group>(null);
  const rightFoot = useRef<Group>(null);
  const stride = useRef(0);
  const walkingBlend = useRef(0);
  const [character, setCharacter] = useState<CharacterVisual | null>(null);
  const keys = useInput(enabled);
  const reducedMotion = useRef(false);

  useEffect(() => {
    let active = true;
    new GLTFLoader().load(characterFile, (gltf) => {
      if (!active) return;
      try { setCharacter(prepareCharacter(gltf.scene, gltf.animations)); }
      catch (error) { console.warn('Character asset could not be prepared; using placeholder', error); }
    }, undefined, (error) => { if (active) console.warn('Character asset could not be loaded; using placeholder', error); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV && !new URLSearchParams(window.location.search).has('diagnostics')) return;
    (window as Window & { __twilightPlayerPosition?: MutableRefObject<Point> }).__twilightPlayerPosition = position;
    return () => { delete (window as Window & { __twilightPlayerPosition?: MutableRefObject<Point> }).__twilightPlayerPosition; };
  }, [position]);

  useEffect(() => {
    if (!import.meta.env.DEV && !new URLSearchParams(window.location.search).has('diagnostics')) return;
    (window as Window & { __twilightPlayerVisualLoaded?: boolean }).__twilightPlayerVisualLoaded = Boolean(character);
    return () => { delete (window as Window & { __twilightPlayerVisualLoaded?: boolean }).__twilightPlayerVisualLoaded; };
  }, [character]);

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
    walkingBlend.current = 0;
  }, [position, spawn, scene]);

  useFrame((_, delta) => {
    const held = keys.current;
    const input = enabled ? {
      x: Number(held.right) - Number(held.left),
      z: Number(held.down) - Number(held.up),
    } : { x: 0, z: 0 };
    const before = position.current;
    if (enabled) {
      const obstacles = scene === 'town' ? townObstacles : observatoryObstacles;
      const bounds = scene === 'town' ? townBounds : observatoryBounds;
      position.current = moveOnGround(position.current, input, delta, obstacles, bounds);
    }
    const displacement = Math.hypot(position.current.x - before.x, position.current.z - before.z);
    const moving = displacement > 0.0001;
    if (!model.current) return;
    model.current.position.set(position.current.x, 0, position.current.z);
    if (moving) model.current.rotation.y = Math.atan2(position.current.x - before.x, position.current.z - before.z);
    const targetBlend = moving && !reducedMotion.current ? Math.min(1, displacement / Math.max(delta, 0.001) / 3.2) : 0;
    walkingBlend.current = reducedMotion.current ? 0
      : walkingBlend.current + (targetBlend - walkingBlend.current) * Math.min(1, delta * 14);
    if (walkingBlend.current > 0.001) stride.current += Math.min(delta, 0.033) * 9;
    const step = Math.sin(stride.current) * walkingBlend.current;
    if (body.current) body.current.position.y = character ? 0 : Math.abs(step) * 0.045;
    if (leftArm.current) leftArm.current.rotation.x = step * 0.3;
    if (rightArm.current) rightArm.current.rotation.x = -step * 0.3;
    if (leftFoot.current) leftFoot.current.position.z = step * 0.075;
    if (rightFoot.current) rightFoot.current.position.z = -step * 0.075;
    if (character) {
      const walkWeight = reducedMotion.current ? 0 : walkingBlend.current;
      character.walk.setEffectiveWeight(walkWeight);
      character.idle.setEffectiveWeight(1 - walkWeight);
      character.walk.timeScale = Math.min(3, Math.max(0.35, displacement / Math.max(delta, 0.001) / 3 * 2.5));
      character.mixer.update(reducedMotion.current ? 0 : delta);
    }
  });

  return <group name="Player" ref={model} position={[spawn.x, 0, spawn.z]}>
    {character && <primitive object={character.object} />}
    <group name="PlayerPlaceholder" ref={body} visible={!character}>
    {[-1, 1].map((side) => <group key={side} ref={side < 0 ? leftFoot : rightFoot} position={[side * 0.16, 0.13, 0.035]}>
      <mesh material={boots}><capsuleGeometry args={[0.115, 0.11, 3, 10]} /></mesh>
      <mesh material={boots} position={[0, -0.06, 0.07]} scale={[0.12, 0.085, 0.2]}><sphereGeometry args={[1, 10, 8]} /></mesh>
    </group>)}
    <mesh material={clothShade} position={[0, 0.45, -0.08]}><coneGeometry args={[0.36, 0.78, 12]} /></mesh>
    {/* Broad body, head, and hat form a stable silhouette in the town shadow map. */}
    <mesh material={cloth} position={[0, 0.48, 0.02]} castShadow><cylinderGeometry args={[0.22, 0.32, 0.72, 12]} /></mesh>
    <mesh material={cloth} position={[0, 0.77, 0]} scale={[0.31, 0.24, 0.25]}><sphereGeometry args={[1, 14, 10]} /></mesh>
    {[-1, 1].map((side) => <group key={side} ref={side < 0 ? leftArm : rightArm} position={[side * 0.31, 0.73, 0]} rotation={[0, 0, side * 0.18]}>
      <mesh material={cloth} position={[0, -0.13, 0]}><capsuleGeometry args={[0.105, 0.23, 3, 10]} /></mesh>
      <mesh material={skin} position={[0, -0.36, 0.025]}><sphereGeometry args={[0.125, 12, 10]} /></mesh>
    </group>)}
    <mesh material={skin} position={[0, 1.08, 0.015]} scale={[0.38, 0.39, 0.36]} castShadow><sphereGeometry args={[1, 20, 14]} /></mesh>
    <mesh material={skin} position={[0, 0.99, 0.36]} scale={[0.12, 0.09, 0.06]}><sphereGeometry args={[1, 10, 8]} /></mesh>
    {[-1, 1].map((side) => <group key={side} position={[side * 0.15, 1.13, 0.344]}>
      <mesh material={eyes} scale={[0.043, 0.065, 0.02]}><sphereGeometry args={[1, 10, 8]} /></mesh>
      <mesh material={skin} position={[-0.012, 0.025, 0.018]} scale={[0.013, 0.019, 0.008]}><sphereGeometry args={[1, 8, 6]} /></mesh>
    </group>)}
    <mesh material={hat} position={[0, 1.32, 0]}><cylinderGeometry args={[0.44, 0.44, 0.12, 18]} /></mesh>
    <mesh material={hat} position={[0, 1.58, 0]} castShadow><coneGeometry args={[0.37, 0.62, 12]} /></mesh>
    <mesh material={clothShade} position={[0, 1.4, 0]}><cylinderGeometry args={[0.345, 0.37, 0.08, 12]} /></mesh>
    <mesh material={gold} position={[0, 1.4, 0.354]} scale={[0.075, 0.065, 0.022]}><sphereGeometry args={[1, 10, 8]} /></mesh>
    </group>
  </group>;
}
