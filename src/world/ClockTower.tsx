import { paint } from './palette';
import { StoneCourse, Window } from './TownDetails';
export function ClockTower() {
  return (
    <group position={[0, 0, -1.7]}>
      <mesh position={[0, 2.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 4.7, 2.1]} />
        <meshStandardMaterial color={paint.cream} roughness={1} />
      </mesh>
      <mesh position={[0, 4.98, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.75, 1.55, 4]} />
        <meshStandardMaterial color={paint.roof} />
      </mesh>
      <StoneCourse width={2.3} depth={2.1} y={0.16} />
      <StoneCourse width={2.3} depth={2.1} y={2.0} />
      <StoneCourse width={2.3} depth={2.1} y={4.55} />
      {[-1, 1].map((side) => <Window key={side} x={side * 0.69} y={2.52} z={1.09} />)}
      <mesh position={[0, 3.45, 1.075]}>
        <circleGeometry args={[0.67, 32]} />
        <meshStandardMaterial color={paint.blue} />
      </mesh>
      <mesh position={[0, 3.45, 1.09]}>
        <torusGeometry args={[0.66, 0.08, 8, 32]} />
        <meshStandardMaterial color={paint.gold} />
      </mesh>
      <mesh position={[0.12, 3.65, 1.1]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.055, 0.55, 0.04]} />
        <meshStandardMaterial color={paint.cream} />
      </mesh>
      <mesh position={[-0.16, 3.43, 1.1]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.055, 0.42, 0.04]} />
        <meshStandardMaterial color={paint.cream} />
      </mesh>
      <mesh position={[0, 0.82, 1.08]}>
        <boxGeometry args={[0.8, 1.62, 0.05]} />
        <meshStandardMaterial color={paint.blue} />
      </mesh>
      <mesh position={[0, 1.67, 1.12]}><boxGeometry args={[0.93, 0.12, 0.18]} /><meshStandardMaterial color={paint.stoneShade} /></mesh>
    </group>
  );
}


