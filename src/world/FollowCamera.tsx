import { useEffect, useLayoutEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { type OrthographicCamera, Vector3 } from 'three';
import { northLookout } from './collision';
import type { Point } from './collision';
import type { SceneId } from './interactions';
import { interiorCameraOffset, interiorCameraPreset } from './interiorCamera';
import { townCameraFocus, townCameraOffset, townCameraZoom } from './townCamera';

const lookoutPosition = new Vector3(northLookout.x, 5.1, northLookout.z + 4.1);
const lookoutTarget = new Vector3(northLookout.x, 10.5, northLookout.z - 20.2);

export function FollowCamera({ position, spawn, scene, lookoutActive }: {
  position: MutableRefObject<Point>; spawn: Point; scene: SceneId; lookoutActive: boolean;
}) {
  const { camera, size } = useThree();
  const destination = useRef(new Vector3());
  const townTarget = useRef(new Vector3());
  const focus = useRef(new Vector3());
  const reduceMotion = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Resizing is handled by the smooth per-frame follow.
  useLayoutEffect(() => {
    if (scene === 'observatory') {
      camera.position.set(0, interiorCameraPreset.height, interiorCameraPreset.depth);
      camera.lookAt(0, interiorCameraPreset.targetHeight, interiorCameraPreset.targetZ);
      focus.current.set(0, interiorCameraPreset.targetHeight, interiorCameraPreset.targetZ);
    } else {
      const target = townCameraFocus(spawn, size.width, size.height, townCameraZoom(size.width, size.height));
      camera.position.set(target.x, townCameraOffset.height, target.z + townCameraOffset.depth);
      camera.lookAt(target.x, 0, target.z);
      focus.current.set(target.x, 0, target.z);
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
        : townCameraZoom(size.width, size.height);
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
    const target = townCameraFocus(position.current, size.width, size.height, zoom);
    destination.current.set(target.x, townCameraOffset.height, target.z + townCameraOffset.depth);
    townTarget.current.set(target.x, 0, target.z);
    camera.position.lerp(destination.current, follow);
    focus.current.lerp(townTarget.current, follow);
    camera.lookAt(focus.current);
  });

  return null;
}
