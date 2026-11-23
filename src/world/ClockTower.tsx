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

function SoftStone({ size, position, surface = stone, radius = 0.08, castShadow = true, receiveShadow = false }: {
  size: [number, number, number]; position: [number, number, number]; surface?: MeshStandardMaterial;
  radius?: number; castShadow?: boolean; receiveShadow?: boolean;
}) {
  const geometry = useMemo(() => new RoundedBoxGeometry(...size, 2, radius), [size[0], size[1], size[2], radius]);
  return <mesh geometry={geometry} material={surface} position={position} castShadow={castShadow} receiveShadow={receiveShadow} />;
}

function ClockFace() {
  const marks = Array.from({ length: 12 }, (_, index) => index);
  return <group name="ClockFace" position={[0, 3.58, 1.34]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} material={weathered} castShadow>
      <cylinderGeometry args={[1.44, 1.44, 0.22, 8]} />
    </mesh>
    <mesh position={[0, 0, 0.12]} material={purple}>
      <circleGeometry args={[1.31, 48]} />
    </mesh>
    <mesh position={[0, 0, 0.18]} material={blue}>
      <circleGeometry args={[1.17, 48]} />
    </mesh>
    <mesh position={[0, 0, 0.16]} material={paleStone} castShadow>
      <torusGeometry args={[1.4, 0.12, 8, 48]} />
    </mesh>
    <mesh position={[0, 0, 0.22]} material={gold}>
      <torusGeometry args={[1.24, 0.065, 8, 48]} />
    </mesh>
    <mesh position={[0, 0, 0.225]} material={purple}>
      <torusGeometry args={[0.79, 0.035, 6, 48]} />
    </mesh>
    {marks.map((mark) => {
      const angle = mark * Math.PI / 6;
      return <mesh key={mark} position={[Math.sin(angle) * 1.01, Math.cos(angle) * 1.01, 0.235]}
        rotation={[0, 0, -angle]} material={mark % 3 === 0 ? gold : paleStone}>
        <boxGeometry args={[mark % 3 === 0 ? 0.1 : 0.055, mark % 3 === 0 ? 0.23 : 0.16, 0.04]} />
      </mesh>;
    })}
    <mesh position={[0, 0.27, 0.27]} rotation={[0, 0, -0.55]} material={gold}>
      <boxGeometry args={[0.1, 0.68, 0.06]} />
    </mesh>
    <mesh position={[-0.23, -0.01, 0.27]} rotation={[0, 0, Math.PI / 2]} material={paleStone}>
      <boxGeometry args={[0.075, 0.52, 0.05]} />
    </mesh>
    <mesh position={[0, 0, 0.31]} material={gold}><sphereGeometry args={[0.11, 12, 8]} /></mesh>
    {[[0, 1.57], [1.57, 0], [0, -1.57], [-1.57, 0]].map(([x, y]) =>
      <mesh key={`${x}-${y}`} position={[x, y, 0.13]} material={x === 0 ? purple : gold}>
        <octahedronGeometry args={[0.16]} />
      </mesh>)}
  </group>;
}

function SideWing({ side }: { side: -1 | 1 }) {
  return <group position={[side * 2.38, 0, 0]}>
    <SoftStone size={[1.38, 2.5, 2.06]} position={[0, 1.27, -0.1]} receiveShadow />
    <SoftStone size={[1.52, 0.25, 2.2]} position={[0, 0.2, -0.1]} surface={weathered} />
    <SoftStone size={[1.55, 0.22, 2.2]} position={[0, 2.48, -0.1]} surface={weathered} />
    <SoftStone size={[1.28, 0.18, 0.26]} position={[0, 2.55, 0.87]} surface={paleStone} />
    <SoftStone size={[0.58, 0.86, 0.09]} position={[0, 1.42, 0.98]} surface={blue} castShadow={false} />
    <SoftStone size={[0.4, 0.64, 0.1]} position={[0, 1.42, 1.04]} surface={gold} castShadow={false} />
  </group>;
}

export function ClockTower() {
  return <group position={clockTowerPosition}>
    <SoftStone size={[3.6, 0.34, 2.65]} position={[0, 0.19, 0]} surface={weathered} receiveShadow />
    <SoftStone size={[3.4, 4.9, 2.38]} position={[0, 2.48, 0]} radius={0.14} receiveShadow />
    <SoftStone size={[3.64, 0.25, 2.55]} position={[0, 2.02, 0]} surface={weathered} />
    <SoftStone size={[3.7, 0.3, 2.6]} position={[0, 4.8, 0]} surface={weathered} />
    {[-1.48, 1.48].map((x) => <SoftStone key={x} size={[0.24, 2.55, 0.27]}
      position={[x, 3.52, 1.18]} surface={weathered} />)}
    <SoftStone size={[1.06, 2.0, 0.12]} position={[0, 1.03, 1.25]} surface={blue} castShadow={false} />
    <SoftStone size={[1.3, 0.2, 0.35]} position={[0, 2.08, 1.22]} surface={paleStone} />
    <ClockFace />
    <SideWing side={-1} /><SideWing side={1} />
    <SoftStone size={[3.05, 0.22, 2.18]} position={[0, 5.06, 0]} surface={paleStone} />
    <SoftStone size={[1.56, 0.9, 1.45]} position={[0, 5.58, 0]} surface={weathered} />
    <SoftStone size={[1.02, 0.64, 0.1]} position={[0, 5.61, 0.76]} surface={blue} castShadow={false} />
    <mesh position={[0, 5.64, 0.84]} material={purple} rotation={[0, 0, Math.PI / 4]}>
      <boxGeometry args={[0.39, 0.39, 0.11]} />
    </mesh>
    <SoftStone size={[1.88, 0.18, 1.7]} position={[0, 6.09, 0]} surface={stone} />
    <mesh position={[0, 6.55, 0]} material={purple} castShadow>
      <coneGeometry args={[0.76, 1.06, 4]} />
    </mesh>
    <mesh position={[0, 7.12, 0]} material={gold}><octahedronGeometry args={[0.16]} /></mesh>
  </group>;
}
