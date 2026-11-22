import { paint } from './palette';
import { BatchedStaticKit } from './BatchedStaticKit';
import { StoneCourse, Window } from './TownDetails';
import { ClockTower } from './ClockTower';
import { ObservatoryExterior } from './ObservatoryExterior';
import { Fountain } from './Fountain';
import { StyleSample } from './StyleSample';

type Point = [number, number];
type Position = [number, number, number];

// The kit is built at world scale with bases at y=0. Decorative pieces never
// participate in collision; collision.ts retains the approved footprints.
function Path({ from, to, width = 1.2 }: { from: Point; to: Point; width?: number }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  return (
    <mesh position={[(from[0] + to[0]) / 2, 0.035, (from[1] + to[1]) / 2]} rotation={[0, Math.atan2(dx, dz), 0]} receiveShadow>
      <boxGeometry args={[width, 0.07, Math.hypot(dx, dz)]} />
      <meshStandardMaterial color={paint.cream} roughness={1} />
    </mesh>
  );
}

function Building({ position, width = 2.2, depth = 2, height = 2.4, roof = paint.roof, groundedFoundation = false }: {
  position: Position; width?: number; depth?: number; height?: number; roof?: string; groundedFoundation?: boolean;
}) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={paint.cream} roughness={1} />
      </mesh>
      {/* Rear houses need a continuous stone edge below the terrain plane. */}
      <StoneCourse width={width} depth={depth} y={groundedFoundation ? 0.1 : 0.18} thickness={groundedFoundation ? 0.24 : 0.13} />
      <StoneCourse width={width} depth={depth} y={height - 0.18} />
      <mesh position={[0, height + 0.38, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[Math.max(width, depth) * 0.66, 0.92, 4]} />
        <meshStandardMaterial color={roof} roughness={0.9} />
      </mesh>
      <mesh position={[0, height + 0.02, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[Math.max(width, depth) * 0.72, 0.18, 4]} />
        <meshStandardMaterial color={paint.blue} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.8, depth / 2 + 0.03]}>
        <boxGeometry args={[0.68, 1.56, 0.06]} />
        <meshStandardMaterial color={paint.blue} />
      </mesh>
      <mesh position={[0, 1.62, depth / 2 + 0.08]}><boxGeometry args={[0.8, 0.11, 0.15]} /><meshStandardMaterial color={paint.stoneShade} /></mesh>
      <mesh position={[0.23, 0.85, depth / 2 + 0.08]}><sphereGeometry args={[0.045, 8, 6]} /><meshStandardMaterial color={paint.gold} metalness={0.3} /></mesh>
      {[-1, 1].map((side) => <Window key={side} x={side * width * 0.31} y={height * 0.65} z={depth / 2 + 0.04} />)}
    </group>
  );
}

function NoticeBoard() {
  return (
    <group position={[-6.5, 0, 2.15]}>
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, 0.9, 0]} castShadow>
          <boxGeometry args={[0.18, 1.8, 0.18]} />
          <meshStandardMaterial color={paint.blue} />
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[2.5, 1.35, 0.22]} />
        <meshStandardMaterial color={paint.cream} />
      </mesh>
      <mesh position={[0, 1.55, 0.13]}>
        <boxGeometry args={[2.15, 1.02, 0.03]} />
        <meshBasicMaterial color={paint.steel} />
      </mesh>
      <mesh position={[0, 2.36, 0]} castShadow>
        <boxGeometry args={[2.72, 0.24, 0.32]} />
        <meshStandardMaterial color={paint.blue} />
      </mesh>
      <mesh position={[0, 2.61, 0]} rotation={[0, 0, Math.PI / 4]} castShadow><boxGeometry args={[0.4, 0.4, 0.4]} /><meshStandardMaterial color={paint.roof} /></mesh>
      <mesh position={[-0.42, 1.64, 0.16]}>
        <boxGeometry args={[0.58, 0.63, 0.02]} />
        <meshBasicMaterial color={paint.gold} />
      </mesh>
      <mesh position={[0.45, 1.53, 0.16]}>
        <boxGeometry args={[0.67, 0.48, 0.02]} />
        <meshBasicMaterial color={paint.cream} />
      </mesh>
    </group>
  );
}

function TownHall() {
  return (
    <group position={[6.5, 0, -1.65]}>
      <Building position={[0, 0, 0]} width={4.3} depth={3.1} height={3} roof={paint.roof} />
      <mesh position={[0, 3.4, 1.6]}>
        <boxGeometry args={[2.15, 0.47, 0.12]} />
        <meshStandardMaterial color={paint.steel} />
      </mesh>
      <mesh position={[0, 1.06, 1.6]}>
        <boxGeometry args={[1.15, 2.04, 0.08]} />
        <meshStandardMaterial color={paint.blue} />
      </mesh>
      <mesh position={[0, 3.74, 1.62]}><boxGeometry args={[1.4, 0.14, 0.16]} /><meshStandardMaterial color={paint.gold} /></mesh>
      <mesh position={[0, 2.15, 1.68]}><boxGeometry args={[1.3, 0.13, 0.22]} /><meshStandardMaterial color={paint.stoneShade} /></mesh>
      {[-1, 1].map((side) => <Window key={side} x={side * 1.48} y={1.85} z={1.61} />)}
    </group>
  );
}

function PostBox() {
  return (
    <group position={[7.4, 0, 4.65]}>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.8, 1.45, 0.64]} />
        <meshStandardMaterial color={paint.blue} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.48, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={paint.roof} />
      </mesh>
      <mesh position={[0, 1.15, 0.33]}>
        <boxGeometry args={[0.46, 0.09, 0.03]} />
        <meshStandardMaterial color={paint.gold} emissive={paint.gold} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.12, 0]}><boxGeometry args={[1.02, 0.23, 0.83]} /><meshStandardMaterial color={paint.stoneShade} /></mesh>
      <mesh position={[0, 0.93, 0.335]}><boxGeometry args={[0.54, 0.09, 0.04]} /><meshStandardMaterial color={paint.cream} /></mesh>
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: Position; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.58, 16]} />
        <meshStandardMaterial color={paint.blue} transparent opacity={0.14} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 1.04, 10]} />
        <meshStandardMaterial color={paint.blue} roughness={0.85} />
      </mesh>
      {[[0, 1.58, 0, 0.82], [-0.47, 1.35, 0.08, 0.57], [0.43, 1.45, -0.08, 0.58], [0, 2.02, 0, 0.62]].map(([x, y, z, radius], index) =>
        <mesh key={`${x}-${y}-${z}`} position={[x, y, z]} scale={[1, 0.88, 0.95]} castShadow>
          <sphereGeometry args={[radius, 16, 12]} />
          <meshStandardMaterial color={index % 2 ? paint.grass : paint.evergreen} roughness={0.86} metalness={0} />
        </mesh>)}
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.36, 0.42, 0.23, 8]} /><meshStandardMaterial color={paint.stoneShade} /></mesh>
    </group>
  );
}

function Lantern({ position }: { position: Position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.075, 2.3, 8]} />
        <meshStandardMaterial color={paint.blue} />
      </mesh>
      <mesh position={[0, 2.36, 0]}>
        <boxGeometry args={[0.43, 0.49, 0.43]} />
        <meshStandardMaterial color={paint.gold} emissive={paint.gold} emissiveIntensity={0.8} />
      </mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[side * 0.24, 2.36, 0]}><boxGeometry args={[0.045, 0.58, 0.49]} /><meshStandardMaterial color={paint.blue} /></mesh>)}
      <mesh position={[0, 2.36, 0]}><boxGeometry args={[0.49, 0.045, 0.49]} /><meshStandardMaterial color={paint.blue} /></mesh>
      <mesh position={[0, 2.68, 0]} castShadow>
        <coneGeometry args={[0.37, 0.27, 4]} />
        <meshStandardMaterial color={paint.roof} />
      </mesh>
    </group>
  );
}

export function Town() {
  return (
    <BatchedStaticKit>
      {/* The display base has depth; the walkable surface and every path stay flat. */}
      <mesh position={[0, -0.43, 0]} receiveShadow>
        <boxGeometry args={[26, 0.86, 21]} />
        <meshStandardMaterial color={paint.blue} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[25.8, 20.8]} />
        <meshStandardMaterial color={paint.grass} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 1.2]} receiveShadow>
        <circleGeometry args={[4.15, 40]} />
        <meshStandardMaterial color={paint.cream} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.095, 1.2]}><ringGeometry args={[3.86, 4.04, 40]} /><meshStandardMaterial color={paint.stoneShade} /></mesh>
      <Path from={[-3.2, 0]} to={[-5.15, -2.65]} />
      <Path from={[-5.15, -2.65]} to={[-7.95, -4.75]} />
      <Path from={[-4, 2]} to={[-6.2, 2]} width={1.1} />
      <Path from={[3.6, 1.2]} to={[5.2, -0.2]} width={1.4} />
      <Path from={[3.6, 2.3]} to={[7.1, 4.1]} width={1.05} />
      <group name="NorthLookout" position={[0, 0, -8.8]}>
        <mesh position={[0, 0.1, 0]} receiveShadow><cylinderGeometry args={[0.75, 0.82, 0.2, 12]} /><meshStandardMaterial color={paint.stoneShade} roughness={1} /></mesh>
        <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.55, 0.65, 12]} /><meshStandardMaterial color={paint.gold} /></mesh>
      </group>
      <group name="ClockTower"><ClockTower /></group>
      <Fountain />
      <group name="NoticeBoard"><NoticeBoard /></group>
      <group name="TownHall"><TownHall /></group>
      <group name="PostBox"><PostBox /></group>
      <group name="ObservatoryExterior"><ObservatoryExterior /></group>
      <StyleSample />
      <Building position={[9.4, 0, -6.3]} width={1.9} depth={1.9} height={1.95} groundedFoundation />
      <Tree position={[-11.25, 0, 2.6]} scale={0.9} />
      <Tree position={[-11.2, 0, -2.6]} scale={1.05} />
      <Tree position={[-4.2, 0, -7.7]} scale={0.8} />
      <Tree position={[4.8, 0, -7.5]} scale={0.9} />
      <Tree position={[10.7, 0, 1.7]} scale={0.85} />
      <Tree position={[10.6, 0, 7.4]} scale={1.1} />
      <Lantern position={[-3.35, 0, -0.5]} />
      <Lantern position={[-5.95, 0, -3.9]} />
      <Lantern position={[3.45, 0, 2.2]} />
    </BatchedStaticKit>
  );
}
