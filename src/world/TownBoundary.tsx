import { paint } from './palette';
import { Shrub, Tree } from './TownScenery';
import { entrancePosts, rearStoneRuns, sideStoneRuns, southStoneRuns } from './townBoundaryLayout';
import type { BoundaryRun } from './townBoundaryLayout';

function StoneRun({ run, rear = false }: { run: BoundaryRun; rear?: boolean }) {
  const dx = run.to[0] - run.from[0];
  const dz = run.to[1] - run.from[1];
  const length = Math.hypot(dx, dz);
  const position: [number, number, number] = [(run.from[0] + run.to[0]) / 2, 0, (run.from[1] + run.to[1]) / 2];
  return <group position={position} rotation={[0, Math.atan2(dx, dz), 0]}>
    <mesh position={[0, run.height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.34, run.height, length]} />
      <meshStandardMaterial color={rear ? paint.steel : paint.stoneShade} roughness={0.98} />
    </mesh>
    <mesh position={[0, run.height + 0.045, 0]} castShadow>
      <boxGeometry args={[0.5, 0.1, length + 0.08]} />
      <meshStandardMaterial color={rear ? paint.stoneShade : paint.cream} roughness={0.97} />
    </mesh>
    {[-1, 1].map((end) => <mesh key={end} position={[0, run.height * 0.52, end * length / 2]} castShadow>
      <boxGeometry args={[0.46, run.height + 0.08, 0.46]} />
      <meshStandardMaterial color={rear ? paint.steel : paint.stoneShade} roughness={1} />
    </mesh>)}
  </group>;
}

function Hedge({ from, to }: { from: [number, number]; to: [number, number] }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const count = Math.max(2, Math.ceil(Math.hypot(dx, dz) / 0.7));
  return <group>
    {Array.from({ length: count }, (_, index) => {
      const t = (index + 0.5) / count;
      const x = from[0] + dx * t;
      const z = from[1] + dz * t;
      const size = 0.37 + (index % 3) * 0.035;
      return <mesh key={`${x.toFixed(3)}-${z.toFixed(3)}`} position={[x, 0.34 + (index % 2) * 0.035, z]} scale={[size * 1.15, size, size]} castShadow>
        <sphereGeometry args={[1, 10, 7]} />
        <meshStandardMaterial color={index % 3 === 0 ? '#4E6651' : '#526C54'} roughness={0.95} />
      </mesh>;
    })}
  </group>;
}

function EntrancePost({ x, z }: { x: number; z: number }) {
  return <group position={[x, 0, z]}>
    <mesh position={[0, 0.08, 0]} receiveShadow><cylinderGeometry args={[0.47, 0.52, 0.16, 8]} /><meshStandardMaterial color={paint.stoneShade} /></mesh>
    <mesh position={[0, 0.65, 0]} castShadow><boxGeometry args={[0.57, 1.15, 0.57]} /><meshStandardMaterial color={paint.stoneShade} roughness={0.98} /></mesh>
    <mesh position={[0, 1.27, 0]} castShadow><boxGeometry args={[0.75, 0.14, 0.75]} /><meshStandardMaterial color={paint.cream} roughness={0.95} /></mesh>
    <mesh position={[0, 1.45, 0]} castShadow><coneGeometry args={[0.31, 0.3, 4]} /><meshStandardMaterial color={paint.roof} roughness={0.95} /></mesh>
  </group>;
}

export function TownBoundary() {
  return <group name="TownBoundary">
    <group name="ClockRearWall">{rearStoneRuns.map((run) => <StoneRun key={run.from.join(',')} run={run} rear />)}</group>
    <group name="SideBoundaries">{sideStoneRuns.map((run) => <StoneRun key={run.from.join(',')} run={run} />)}</group>
    <group name="SouthEntrance">
      {southStoneRuns.map((run) => <StoneRun key={run.from.join(',')} run={run} />)}
      {entrancePosts.map(([x, z]) => <EntrancePost key={x} x={x} z={z} />)}
    </group>
    <Hedge from={[-13.8, -2.6]} to={[-13.5, -0.9]} />
    <Hedge from={[-13.8, 6.0]} to={[-13.15, 8.2]} />
    <Hedge from={[13.8, -3.7]} to={[13.5, -1.4]} />
    <Hedge from={[13.8, 5.85]} to={[13.2, 8.2]} />
    <Hedge from={[-10.3, 10.95]} to={[-6.7, 10.6]} />
    <Hedge from={[6.7, 10.6]} to={[10.3, 10.95]} />
    <Tree position={[-14.5, 0, -2.6]} scale={0.95} />
    <Tree position={[-14.2, 0, 3.4]} scale={1.12} />
    <Tree position={[-13.8, 0, 8.65]} scale={0.86} />
    <Tree position={[14.5, 0, -5.0]} scale={0.92} />
    <Tree position={[14.2, 0, 0.5]} scale={1.06} />
    <Tree position={[13.9, 0, 5.4]} scale={0.83} />
    <Tree position={[14.35, 0, 9.1]} scale={1.04} />
    <Tree position={[-9.8, 0, -15.05]} scale={0.92} />
    <Tree position={[-1.1, 0, -15.15]} scale={0.9} />
    <Tree position={[7.2, 0, -14.8]} scale={0.83} />
    <Tree position={[-10.7, 0, 11.6]} scale={0.82} />
    <Tree position={[10.9, 0, 11.55]} scale={0.89} />
    <Shrub position={[-12.1, 0, 7.9]} scale={0.95} />
    <Shrub position={[12.15, 0, -5.65]} scale={1.1} />
    <Shrub position={[10.85, 0, -8.45]} scale={1.2} />
    <Shrub position={[-1.95, 0, -14.25]} scale={1.15} />
  </group>;
}
