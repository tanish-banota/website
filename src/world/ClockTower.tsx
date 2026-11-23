import { useMemo } from 'react';
import { MeshStandardMaterial, Shape, ShapeGeometry, Vector2 } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { paint } from './palette';

export const clockTowerPosition: [number, number, number] = [0, 0, -3.7];

const stone = new MeshStandardMaterial({ color: paint.cream, roughness: 0.88 });
const weathered = new MeshStandardMaterial({ color: '#D8CCBC', roughness: 0.96 });
const paleStone = new MeshStandardMaterial({ color: '#E8DFD1', roughness: 0.92 });
const blue = new MeshStandardMaterial({ color: paint.blue, roughness: 0.78 });
const purple = new MeshStandardMaterial({ color: paint.roof, roughness: 0.83 });
const gold = new MeshStandardMaterial({ color: paint.gold, roughness: 0.66, metalness: 0.08 });
const shaftStone = new MeshStandardMaterial({ color: '#C4B8A8', roughness: 0.98 });
const mortar = new MeshStandardMaterial({ color: '#9F9384', roughness: 1 });
const dialGround = new MeshStandardMaterial({ color: paint.steel, roughness: 0.94 });

const minuteHand = new ShapeGeometry(new Shape([
  new Vector2(-0.1, -0.07), new Vector2(0.08, 0.04),
  new Vector2(0.88, 0.89), new Vector2(0.52, 0.83),
]));
const hourHand = new ShapeGeometry(new Shape([
  new Vector2(-0.08, -0.08), new Vector2(0.02, 0.07),
  new Vector2(-0.63, 0.25), new Vector2(-0.7, 0.06),
]));

function SoftStone({ size, position, surface = stone, radius = 0.08, castShadow = true, receiveShadow = false }: {
  size: [number, number, number]; position: [number, number, number]; surface?: MeshStandardMaterial;
  radius?: number; castShadow?: boolean; receiveShadow?: boolean;
}) {
  const geometry = useMemo(() => new RoundedBoxGeometry(...size, 2, radius), [size[0], size[1], size[2], radius]);
  return <mesh geometry={geometry} material={surface} position={position} castShadow={castShadow} receiveShadow={receiveShadow} />;
}

function ClockFace() {
  const marks = Array.from({ length: 8 }, (_, index) => index);
  return <group name="ClockFace" position={[0, 3.72, 1.42]} scale={[0.94, 0.94, 1]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} material={weathered} castShadow receiveShadow>
      <cylinderGeometry args={[1.62, 1.62, 0.48, 8]} />
    </mesh>
    <mesh position={[0, 0, 0.25]} material={purple}>
      <circleGeometry args={[1.43, 48]} />
    </mesh>
    <mesh position={[0, 0, 0.28]} material={dialGround}>
      <circleGeometry args={[1.31, 48]} />
    </mesh>
    {Array.from({ length: 8 }, (_, index) => {
      const angle = index * Math.PI / 4;
      return <mesh key={angle} position={[Math.sin(angle) * 1.53, Math.cos(angle) * 1.53, 0.28]}
        rotation={[0, 0, -angle]} material={index % 2 === 0 ? weathered : shaftStone} castShadow>
        <boxGeometry args={[0.38, 0.27, 0.12]} />
      </mesh>;
    })}
    <mesh position={[0, 0, 0.31]} material={gold}>
      <torusGeometry args={[1.32, 0.075, 8, 48]} />
    </mesh>
    <mesh position={[0, 0, 0.32]} material={blue}>
      <torusGeometry args={[0.52, 0.055, 6, 36]} />
    </mesh>
    {marks.map((mark) => {
      const angle = mark * Math.PI / 4;
      return <mesh key={mark} position={[Math.sin(angle) * 1.14, Math.cos(angle) * 1.14, 0.34]}
        rotation={[0, 0, -angle]} material={mark % 2 === 0 ? gold : stone}>
        <boxGeometry args={[mark % 2 === 0 ? 0.105 : 0.07, mark % 2 === 0 ? 0.22 : 0.15, 0.035]} />
      </mesh>;
    })}
    {[0, 1, 2, 3].map((index) => {
      const angle = index * Math.PI / 2;
      const x = Math.sin(angle) * 0.78;
      const y = Math.cos(angle) * 0.78;
      return <group key={index} position={[x, y, 0.34]}>
        <mesh material={gold}><torusGeometry args={[0.17, 0.045, 6, 20]} /></mesh>
        <mesh position={[0, 0, 0.015]} material={purple}><circleGeometry args={[0.1, 16]} /></mesh>
      </group>;
    })}
    {[0, 1, 2, 3].map((index) => <mesh key={index} position={[0, 0, 0.35]}
      rotation={[0, 0, index * Math.PI / 2 + 0.12]} material={paleStone}>
      <torusGeometry args={[0.54, 0.035, 6, 16, Math.PI * 0.38]} />
    </mesh>)}
    <mesh geometry={minuteHand} position={[0, 0, 0.4]} material={gold} />
    <mesh geometry={hourHand} position={[0, 0, 0.42]} material={gold} />
    <mesh position={[0, 0, 0.45]} material={gold}><sphereGeometry args={[0.14, 12, 8]} /></mesh>
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

function StoneCourses() {
  return <group name="ClockStoneCourses">
    {Array.from({ length: 9 }, (_, row) => {
      const y = 2.72 + row * 0.38;
      const front = 1.27 - (y - 2.35) * (0.16 / 3.55);
      const width = front * 2 - 0.12;
      return <group key={y}>
        <mesh position={[0, y, front + 0.035]} material={mortar}>
          <boxGeometry args={[width, 0.036, 0.025]} />
        </mesh>
        {[-1, 1].map((side) => <mesh key={side}
          position={[side * (row % 2 === 0 ? width * 0.28 : width * 0.36), y + 0.2, front + 0.035]}
          material={mortar}>
          <boxGeometry args={[0.024, 0.2, 0.025]} />
        </mesh>)}
      </group>;
    })}
  </group>;
}

export function ClockTower() {
  return <group position={clockTowerPosition}>
    <SoftStone size={[3.6, 0.34, 2.65]} position={[0, 0.19, 0]} surface={weathered} receiveShadow />
    <SoftStone size={[3.4, 2.36, 2.38]} position={[0, 1.22, 0]} radius={0.14} receiveShadow />
    <SoftStone size={[3.8, 0.28, 2.67]} position={[0, 2.39, 0]} surface={weathered} />
    <mesh position={[0, 4.13, 0]} rotation={[0, Math.PI / 4, 0]}
      material={shaftStone} castShadow receiveShadow>
      <cylinderGeometry args={[1.57, 1.8, 3.55, 4]} />
    </mesh>
    <StoneCourses />
    <SoftStone size={[1.06, 2.0, 0.12]} position={[0, 1.03, 1.25]} surface={blue} castShadow={false} />
    <SoftStone size={[1.4, 0.23, 0.37]} position={[0, 2.07, 1.23]} surface={paleStone} />
    <mesh position={[0, 1.16, 1.34]} material={gold}>
      <octahedronGeometry args={[0.16]} />
    </mesh>
    <ClockFace />
    <SideWing side={-1} /><SideWing side={1} />
    <SoftStone size={[2.12, 0.18, 2.12]} position={[0, 5.94, 0]} surface={weathered} />
    <mesh position={[0, 6.3, 0]} material={shaftStone} castShadow>
      <cylinderGeometry args={[0.43, 0.55, 0.58, 8]} />
    </mesh>
    <mesh position={[0, 6.7, 0]} scale={[1, 0.82, 1]} material={shaftStone} castShadow receiveShadow>
      <sphereGeometry args={[0.74, 14, 10]} />
    </mesh>
  </group>;
}
