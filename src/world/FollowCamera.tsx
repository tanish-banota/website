import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { Point } from './collision';

const CAMERA_HEIGHT = 18;
const CAMERA_DEPTH = 20;

export function FollowCamera({ position }: { position: MutableRefObject<Point> }) {
  const camera = useThree((state) => state.camera);
  const destination = useRef(new Vector3());
  const reduceMotion = useRef(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reduceMotion.current = query.matches; };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useFrame((_, delta) => {
    destination.current.set(position.current.x, CAMERA_HEIGHT, position.current.z + CAMERA_DEPTH);
    const follow = reduceMotion.current ? 1 : 1 - Math.exp(-8 * Math.max(0, delta));
    camera.position.lerp(destination.current, follow);
    camera.lookAt(camera.position.x, camera.position.y - CAMERA_HEIGHT, camera.position.z - CAMERA_DEPTH);
  });

  return null;
}
