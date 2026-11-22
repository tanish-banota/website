import { useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { paint } from './palette';

export const clockTowerPosition: [number, number, number] = [0, 0, -3.7];

const stone = new MeshStandardMaterial({ color: paint.cream, roughness: 0.88 });
const weathered = new MeshStandardMaterial({ color: '#D8CCBC', roughness: 0.96 });
const paleStone = new MeshStandardMaterial({ color: '#E8DFD1', roughness: 0.92 });
const blue = new MeshStandardMaterial({ color: paint.blue, roughness: 0.78 });
const purple = new MeshStandardMaterial({ color: paint.roof, roughness: 0.83 });
const gold = new MeshStandardMaterial({ color: paint.gold, roughness: 0.66, metalness: 0.08 });

function SoftStone({ size, position, surface = stone, radius = 0.08, castShadow = true }: {
  size: [number, number, number]; position: [number, number, number]; surface?: MeshStandardMaterial;
  radius?: number; castShadow?: boolean;
}) {
  const geometry = useMemo(() => new RoundedBoxGeometry(...size, 2, radius), [size[0], size[1], size[2], radius]);
  return <mesh geometry={geometry} material={surface} position={position} castShadow={castShadow} />;
}

function ClockFace() {
  const marks = Array.from({ length: 12 }, (_, index) => index);
  return <group name="ClockFace" position={[0, 3.55, 1.29]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} material={weathered} castShadow>
      <cylinderGeometry args={[1.3, 1.3, 0.16, 48]} />
    </mesh>
    <mesh position={[0, 0, 0.1]} material={blue}><circleGeometry args={[1.16, 48]} /></mesh>
    <mesh position={[0, 0, 0.15]} material={gold}><torusGeometry args={[1.18, 0.085, 8, 48]} /></mesh>
    <mesh position={[0, 0, 0.17]} material={paleStone}><torusGeometry args={[0.98, 0.025, 6, 48]} /></mesh>
    <mesh position={[0, 0, 0.17]} material={purple}><torusGeometry args={[0.69, 0.025, 6, 48]} /></mesh>
    {marks.map((mark) => {
      const angle = mark * Math.PI / 6;
      return <mesh key={mark} position={[Math.sin(angle) * 0.84, Math.cos(angle) * 0.84, 0.19]}
        rotation={[0, 0, -angle]} material={mark % 3 === 0 ? gold : paleStone}>
        <boxGeometry args={[mark % 3 === 0 ? 0.085 : 0.045, 0.19, 0.035]} />
      </mesh>;
    })}
    <mesh position={[0, 0.25, 0.21]} rotation={[0, 0, -0.55]} material={gold}>
      <boxGeometry args={[0.085, 0.58, 0.05]} />
    </mesh>
    <mesh position={[-0.2, -0.01, 0.22]} rotation={[0, 0, Math.PI / 2]} material={paleStone}>
      <boxGeometry args={[0.07, 0.47, 0.05]} />
    </mesh>
    <mesh position={[0, 0, 0.24]} material={gold}><sphereGeometry args={[0.095, 12, 8]} /></mesh>
    <mesh position={[0, -1.12, 0.16]} material={purple}><octahedronGeometry args={[0.12]} /></mesh>
  </group>;
}

function SideWing({ side }: { side: -1 | 1 }) {
  return <group position={[side * 2.38, 0, 0]}>
    <SoftStone size={[1.38, 2.5, 2.06]} position={[0, 1.27, -0.1]} />
    <SoftStone size={[1.52, 0.25, 2.2]} position={[0, 0.2, -0.1]} surface={weathered} />
    <SoftStone size={[1.55, 0.22, 2.2]} position={[0, 2.48, -0.1]} surface={weathered} />
    {[-0.49, 0, 0.49].map((x) => <SoftStone key={x} size={[0.34, 0.32, 0.32]}
      position={[x, 2.75, 0.82]} surface={x === 0 ? stone : paleStone} />)}
    <SoftStone size={[0.58, 0.86, 0.09]} position={[0, 1.42, 0.98]} surface={blue} castShadow={false} />
    <SoftStone size={[0.4, 0.64, 0.1]} position={[0, 1.42, 1.04]} surface={gold} castShadow={false} />
  </group>;
}

export function ClockTower() {
  return <group position={clockTowerPosition}>
    <SoftStone size={[3.6, 0.34, 2.65]} position={[0, 0.19, 0]} surface={weathered} />
    <SoftStone size={[3.4, 4.9, 2.38]} position={[0, 2.48, 0]} radius={0.14} />
    <SoftStone size={[3.64, 0.25, 2.55]} position={[0, 2.02, 0]} surface={weathered} />
    <SoftStone size={[3.7, 0.3, 2.6]} position={[0, 4.8, 0]} surface={weathered} />
    {[-1.47, 1.47].map((x) => [0.7, 1.35, 2.7, 4.15].map((y) =>
      <SoftStone key={`${x}-${y}`} size={[0.28, 0.34, 0.28]} position={[x, y, 1.11]}
        surface={y === 1.35 || y === 4.15 ? paleStone : weathered} />))}
    <SoftStone size={[1.06, 2.0, 0.12]} position={[0, 1.03, 1.25]} surface={blue} castShadow={false} />
    <SoftStone size={[1.3, 0.2, 0.35]} position={[0, 2.08, 1.22]} surface={paleStone} />
    <ClockFace />
    <SideWing side={-1} /><SideWing side={1} />
    <SoftStone size={[3.04, 0.27, 2.15]} position={[0, 5.14, 0]} surface={paleStone} />
    <SoftStone size={[2.2, 0.36, 1.84]} position={[0, 5.47, 0]} surface={weathered} />
    <SoftStone size={[1.45, 0.42, 1.45]} position={[0, 5.83, 0]} surface={stone} />
    <mesh position={[0, 6.23, 0]} material={purple} castShadow>
      <coneGeometry args={[0.95, 0.9, 4]} />
    </mesh>
    <mesh position={[0, 6.72, 0]} material={gold}><octahedronGeometry args={[0.16]} /></mesh>
  </group>;
}
