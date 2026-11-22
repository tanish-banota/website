import { useEffect, useLayoutEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { type OrthographicCamera, Vector3 } from 'three';
import { northLookout } from './collision';
import type { Point } from './collision';
import type { SceneId } from './interactions';
import { interiorCameraOffset, interiorCameraPreset } from './interiorCamera';

const townOffset = { height: 18, depth: 20, focus: 4 };
const lookoutPosition = new Vector3(northLookout.x, 5.1, -4.7);
const lookoutTarget = new Vector3(northLookout.x, 10.5, -29);

export function FollowCamera({ position, spawn, scene, lookoutActive }: {
  position: MutableRefObject<Point>; spawn: Point; scene: SceneId; lookoutActive: boolean;
}) {
  const { camera, size } = useThree();
  const destination = useRef(new Vector3());
  const townTarget = useRef(new Vector3());
  const focus = useRef(new Vector3());
  const reduceMotion = useRef(false);

  useLayoutEffect(() => {
    if (scene === 'observatory') {
      camera.position.set(0, interiorCameraPreset.height, interiorCameraPreset.depth);
      camera.lookAt(0, interiorCameraPreset.targetHeight, interiorCameraPreset.targetZ);
      focus.current.set(0, interiorCameraPreset.targetHeight, interiorCameraPreset.targetZ);
    } else {
      camera.position.set(spawn.x, townOffset.height, spawn.z + townOffset.depth - townOffset.focus);
      camera.lookAt(spawn.x, 0, spawn.z - townOffset.focus);
      focus.current.set(spawn.x, 0, spawn.z - townOffset.focus);
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
    const follow = reduceMotion.current ? 1 : 1 - Math.exp(-(lookoutActive ? 1.5 : 8) * Math.max(0, delta));
    const orthographic = camera as OrthographicCamera;
    const zoom = scene === 'observatory' ? Math.min(size.width / 9.3, size.height / 8.2)
      : lookoutActive ? Math.min(size.width / 19, size.height / 18)
        : Math.min(size.width / 27, size.height / 17);
    if (Math.abs(orthographic.zoom - zoom) > 0.01) {
      orthographic.zoom += (zoom - orthographic.zoom) * follow;
      orthographic.updateProjectionMatrix();
    }
    if (scene === 'observatory') {
      const { x, z } = interiorCameraOffset(position.current, spawn);
      destination.current.set(x, interiorCameraPreset.height, interiorCameraPreset.depth + z);
      camera.position.lerp(destination.current, follow);
      camera.lookAt(camera.position.x, interiorCameraPreset.targetHeight,
        camera.position.z - interiorCameraPreset.depth + interiorCameraPreset.targetZ);
      return;
    }
    if (lookoutActive) {
      destination.current.copy(lookoutPosition);
      focus.current.lerp(lookoutTarget, follow);
      camera.position.lerp(destination.current, follow);
      camera.lookAt(focus.current);
      return;
    }
    destination.current.set(position.current.x, townOffset.height,
      position.current.z + townOffset.depth - townOffset.focus);
    townTarget.current.set(position.current.x, 0, position.current.z - townOffset.focus);
    camera.position.lerp(destination.current, follow);
    focus.current.lerp(townTarget.current, follow);
    camera.lookAt(focus.current);
  });

  return null;
}
