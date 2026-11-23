import { paint } from './palette';
import { BatchedStaticKit } from './BatchedStaticKit';
import { ClockTower } from './ClockTower';
import { ObservatoryExterior } from './ObservatoryExterior';
import { Fountain } from './Fountain';
import { TownHall } from './TownBuilding';
import { GardenPatch, Shrub, Tree } from './TownScenery';
import { northLookout } from './collision';
import { TownBoundary } from './TownBoundary';
import { TownGround } from './TownGround';

type Position = [number, number, number];

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
        <boxGeometry args={[70, 0.86, 70]} />
        <meshStandardMaterial color={paint.blue} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[69.8, 69.8]} />
        <meshStandardMaterial color={paint.grass} roughness={0.95} />
      </mesh>
      <TownGround />
      <TownBoundary />
      <group name="NorthLookout" position={[northLookout.x, 0, northLookout.z]}>
        <mesh position={[0, -0.06, 0]} receiveShadow>
          <cylinderGeometry args={[1.88, 1.98, 0.14, 20]} />
          <meshStandardMaterial color={paint.stoneShade} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.019, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.66, 1.78, 32]} />
          <meshStandardMaterial color={paint.cream} roughness={0.9} />
        </mesh>
        {[-1, 1].map((side) => <group key={side}>
          <mesh position={[side * 1.95, 0.48, -0.3]} castShadow receiveShadow>
            <boxGeometry args={[0.38, 0.96, 1.68]} />
            <meshStandardMaterial color={paint.stoneShade} roughness={0.94} />
          </mesh>
          <mesh position={[side * 1.48, 0.39, -1.15]} castShadow receiveShadow>
            <boxGeometry args={[1.13, 0.78, 0.32]} />
            <meshStandardMaterial color={paint.cream} roughness={0.94} />
          </mesh>
          <mesh position={[side * 1.95, 1.01, -0.3]}>
            <boxGeometry args={[0.44, 0.1, 1.73]} />
            <meshStandardMaterial color={paint.cream} roughness={0.86} />
          </mesh>
        </group>)}
      </group>
      <group name="ClockTower"><ClockTower /></group>
      <Fountain />
      <group name="NoticeBoard"><NoticeBoard /></group>
      <group name="TownHall"><TownHall /></group>
      <group name="PostBox"><PostBox /></group>
      <group name="ObservatoryExterior"><ObservatoryExterior /></group>
      <group name="TownScenery">
        <Tree position={[-11.25, 0, 2.6]} scale={0.9} />
        <Tree position={[-11.2, 0, -2.6]} scale={1.05} />
        <Tree position={[4.8, 0, -7.5]} scale={0.9} />
        <Tree position={[10.7, 0, 1.7]} scale={0.85} />
        <Tree position={[10.6, 0, 7.4]} scale={1.1} />
        <GardenPatch position={[-10.1, 0, 5.2]} />
        <GardenPatch position={[9.35, 0, -2.4]} size={0.85} />
        <GardenPatch position={[8.9, 0, 7.85]} size={0.9} />
        <Shrub position={[-11.75, 0, 4.4]} />
        <Shrub position={[-10.25, 0, -0.95]} scale={0.8} />
        <Shrub position={[5.8, 0, -8.2]} scale={0.85} />
        <Shrub position={[11.65, 0, 2.8]} scale={0.8} />
        <Shrub position={[11.8, 0, 6.15]} scale={0.9} />
      </group>
      <Lantern position={[-4.55, 0, 0.25]} />
      <Lantern position={[-5.95, 0, -3.9]} />
      <Lantern position={[4.6, 0, 2.1]} />
    </BatchedStaticKit>
  );
}
