import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ConeGeometry, MeshStandardMaterial } from 'three';
import type { Group } from 'three';
import { paint } from './palette';

// A few foreground shoots move independently of the static, exported town kit.
const leaf = new ConeGeometry(0.12, 0.35, 5);
const dark = new MeshStandardMaterial({ color: paint.evergreen, roughness: 0.9 });
const light = new MeshStandardMaterial({ color: '#62765C', roughness: 0.9 });
const sites: Array<[number, number, number]> = [
  [-11.35, 0, -4.45], [4.42, 0, 4.62], [-3.38, 0, 8.56],
];

export function AmbientFoliage() {
  const shoots = useRef<Group[]>([]);
  useFrame(({ clock }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    shoots.current.forEach((shoot, index) => {
      shoot.rotation.z = reduced ? 0 : Math.sin(clock.elapsedTime * 0.58 + index * 1.7) * 0.035;
      shoot.rotation.x = reduced ? 0 : Math.sin(clock.elapsedTime * 0.47 + index * 2.1) * 0.025;
    });
  });
  return <group name="AmbientFoliage">
    {sites.map(([x, y, z], index) => <group key={`${x}-${z}`} position={[x, y, z]}
      ref={(node) => { if (node) shoots.current[index] = node; }}>
      <mesh geometry={leaf} material={dark} position={[-0.1, 0.18, 0]} rotation={[0, 0, -0.28]} />
      <mesh geometry={leaf} material={light} position={[0.1, 0.16, 0]} rotation={[0, 0, 0.3]} />
    </group>)}
  </group>;
}
