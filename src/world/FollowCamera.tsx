import { useEffect, useLayoutEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { Point } from './collision';
import type { SceneId } from './interactions';

function offset(scene: SceneId) {
  return scene === 'town' ? { height: 18, depth: 20, focus: 3.5 } : { height: 9, depth: 11, focus: 0 };
}

export function FollowCamera({ position, spawn, scene }: { position: MutableRefObject<Point>; spawn: Point; scene: SceneId }) {
  const camera = useThree((state) => state.camera);
  const destination = useRef(new Vector3());
  const reduceMotion = useRef(false);

  useLayoutEffect(() => {
    const { height, depth, focus } = offset(scene);
    camera.position.set(spawn.x, height, spawn.z + depth - focus);
    camera.lookAt(spawn.x, 0, spawn.z - focus);
  }, [camera, scene, spawn]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reduceMotion.current = query.matches; };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useFrame((_, delta) => {
    const { height, depth, focus } = offset(scene);
    destination.current.set(position.current.x, height, position.current.z + depth - focus);
    const follow = reduceMotion.current ? 1 : 1 - Math.exp(-8 * Math.max(0, delta));
    camera.position.lerp(destination.current, follow);
    camera.lookAt(camera.position.x, camera.position.y - height, camera.position.z - depth);
  });

  return null;
}
