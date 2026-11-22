type Point = [number, number];
type Position = [number, number, number];

const paint = {
  cream: '#F3EBDD',
  blue: '#263750',
  roof: '#665087',
  grass: '#68765A',
  gold: '#EDBC70',
  steel: '#627D93',
} as const;

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

function Building({ position, width = 2.2, depth = 2, height = 2.4, roof = paint.roof }: {
  position: Position; width?: number; depth?: number; height?: number; roof?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={paint.cream} roughness={1} />
      </mesh>
      <mesh position={[0, height + 0.38, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[Math.max(width, depth) * 0.8, 0.92, 4]} />
        <meshStandardMaterial color={roof} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.8, depth / 2 + 0.03]}>
        <boxGeometry args={[0.68, 1.56, 0.06]} />
        <meshStandardMaterial color={paint.blue} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * width * 0.31, height * 0.65, depth / 2 + 0.04]}>
          <boxGeometry args={[0.43, 0.54, 0.06]} />
          <meshStandardMaterial color={paint.gold} emissive={paint.gold} emissiveIntensity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function ClockTower() {
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
      <Building position={[0, 0, 0]} width={4.3} depth={3.1} height={3} roof={paint.blue} />
      <mesh position={[0, 3.4, 1.6]}>
        <boxGeometry args={[2.15, 0.47, 0.12]} />
        <meshStandardMaterial color={paint.steel} />
      </mesh>
      <mesh position={[0, 1.06, 1.6]}>
        <boxGeometry args={[1.15, 2.04, 0.08]} />
        <meshStandardMaterial color={paint.blue} />
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
    </group>
  );
}

function Observatory() {
  return (
    <group position={[-8.3, 0, -6.45]}>
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.25, 2.35, 2.1, 20]} />
        <meshStandardMaterial color={paint.cream} roughness={1} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <sphereGeometry args={[2.28, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={paint.steel} emissive={paint.steel} emissiveIntensity={0.2} roughness={0.7} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.85, 2.25]}>
        <boxGeometry args={[0.96, 1.6, 0.11]} />
        <meshStandardMaterial color={paint.blue} />
      </mesh>
      <mesh position={[0, 1.75, 2.31]}>
        <boxGeometry args={[1.25, 0.12, 0.13]} />
        <meshStandardMaterial color={paint.gold} emissive={paint.gold} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: Position; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.17, 1.04, 8]} />
        <meshStandardMaterial color={paint.blue} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <coneGeometry args={[0.85, 2, 7]} />
        <meshStandardMaterial color="#425C50" roughness={1} />
      </mesh>
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
      <mesh position={[0, 2.68, 0]} castShadow>
        <coneGeometry args={[0.37, 0.27, 4]} />
        <meshStandardMaterial color={paint.roof} />
      </mesh>
    </group>
  );
}

export function Town() {
  return (
    <group>
      {/* The display base has depth; the walkable surface and every path stay flat. */}
      <mesh position={[0, -0.43, 0]} receiveShadow>
        <boxGeometry args={[26, 0.86, 21]} />
        <meshStandardMaterial color={paint.blue} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[25.8, 20.8]} />
        <meshStandardMaterial color={paint.grass} emissive={paint.grass} emissiveIntensity={0.25} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 1.2]} receiveShadow>
        <circleGeometry args={[4.15, 40]} />
        <meshStandardMaterial color={paint.cream} roughness={1} />
      </mesh>
      <Path from={[-3.2, 0]} to={[-5.15, -2.65]} />
      <Path from={[-5.15, -2.65]} to={[-7.95, -4.75]} />
      <Path from={[-4, 2]} to={[-6.2, 2]} width={1.1} />
      <Path from={[3.6, 1.2]} to={[5.2, -0.2]} width={1.4} />
      <Path from={[3.6, 2.3]} to={[7.1, 4.1]} width={1.05} />
      <ClockTower />
      <NoticeBoard />
      <TownHall />
      <PostBox />
      <Observatory />
      <Building position={[2.95, 0, -6.2]} />
      <Building position={[9.4, 0, -6.3]} width={1.9} depth={1.9} height={1.95} />
      <Tree position={[-11.25, 0, 2.6]} scale={0.9} />
      <Tree position={[-11.2, 0, -2.6]} scale={1.05} />
      <Tree position={[-4.2, 0, -7.7]} scale={0.8} />
      <Tree position={[3.4, 0, -8.3]} scale={0.9} />
      <Tree position={[10.7, 0, 1.7]} scale={0.85} />
      <Tree position={[10.6, 0, 7.4]} scale={1.1} />
      <Lantern position={[-3.35, 0, -0.5]} />
      <Lantern position={[-5.95, 0, -3.9]} />
      <Lantern position={[3.45, 0, 2.2]} />
    </group>
  );
}
