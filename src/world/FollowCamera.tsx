import { useEffect, useLayoutEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { Point } from './collision';
import type { SceneId } from './interactions';
import { interiorCameraOffset, interiorCameraPreset } from './interiorCamera';

const townOffset = { height: 18, depth: 20, focus: 4 };

export function FollowCamera({ position, spawn, scene }: { position: MutableRefObject<Point>; spawn: Point; scene: SceneId }) {
  const camera = useThree((state) => state.camera);
  const destination = useRef(new Vector3());
  const reduceMotion = useRef(false);

  useLayoutEffect(() => {
    if (scene === 'observatory') {
      camera.position.set(0, interiorCameraPreset.height, interiorCameraPreset.depth);
      camera.lookAt(0, interiorCameraPreset.targetHeight, interiorCameraPreset.targetZ);
    } else {
      camera.position.set(spawn.x, townOffset.height, spawn.z + townOffset.depth - townOffset.focus);
      camera.lookAt(spawn.x, 0, spawn.z - townOffset.focus);
    }
  }, [camera, scene, spawn]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reduceMotion.current = query.matches; };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useFrame((_, delta) => {
    if (scene === 'observatory') {
      const { x, z } = interiorCameraOffset(position.current, spawn);
      destination.current.set(x, interiorCameraPreset.height, interiorCameraPreset.depth + z);
      const follow = reduceMotion.current ? 1 : 1 - Math.exp(-8 * Math.max(0, delta));
      camera.position.lerp(destination.current, follow);
      camera.lookAt(camera.position.x, interiorCameraPreset.targetHeight,
        camera.position.z - interiorCameraPreset.depth + interiorCameraPreset.targetZ);
      return;
    }
    destination.current.set(position.current.x, townOffset.height,
      position.current.z + townOffset.depth - townOffset.focus);
    const follow = reduceMotion.current ? 1 : 1 - Math.exp(-8 * Math.max(0, delta));
    camera.position.lerp(destination.current, follow);
    camera.lookAt(camera.position.x, camera.position.y - townOffset.height, camera.position.z - townOffset.depth);
  });

  return null;
}
