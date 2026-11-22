import { useMemo } from 'react';
import { MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import { paint } from './palette';

const housing = new MeshStandardMaterial({ color: paint.blue, roughness: 0.7, metalness: 0.16 });
const barrel = new MeshStandardMaterial({ color: paint.steel, roughness: 0.57, metalness: 0.22 });
const collar = new MeshStandardMaterial({ color: '#B9A06F', roughness: 0.68, metalness: 0.14 });

function Strut({ from, to, radius }: { from: [number, number, number]; to: [number, number, number]; radius: number }) {
  const a = useMemo(() => new Vector3(...from), [from]);
  const b = useMemo(() => new Vector3(...to), [to]);
  const direction = b.clone().sub(a);
  const rotation = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());
  return <mesh position={a.add(b).multiplyScalar(0.5)} quaternion={rotation} material={housing} castShadow>
    <cylinderGeometry args={[radius, radius, direction.length(), 10]} />
  </mesh>;
}

export function InteriorTelescope() {
  const direction = useMemo(() => new Vector3(-0.56, 0.72, -0.41).normalize(), []);
  const rotation = useMemo(() => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction), [direction]);
  return <group name="Telescope" position={[-0.9, 0, -1.1]}>
    <group name="TelescopeMount">
      <mesh position={[0, 0.16, 0]} material={collar} castShadow>
        <cylinderGeometry args={[0.64, 0.69, 0.3, 16]} />
      </mesh>
      <mesh position={[0, 0.88, 0]} material={housing} castShadow>
        <cylinderGeometry args={[0.24, 0.4, 1.2, 12]} />
      </mesh>
      <mesh position={[0, 1.53, 0]} material={collar} castShadow>
        <sphereGeometry args={[0.31, 14, 10]} />
      </mesh>
      <Strut from={[-0.25, 0.28, 0.28]} to={[-0.36, 1.69, -0.11]} radius={0.11} />
      <Strut from={[0.25, 0.28, 0.28]} to={[0.06, 1.69, -0.11]} radius={0.11} />
      <Strut from={[-0.22, 1.5, 0]} to={[-0.54, 2.35, -0.55]} radius={0.12} />
      <Strut from={[0.22, 1.5, 0]} to={[-0.16, 2.35, -0.55]} radius={0.12} />
    </group>
    <group name="TelescopeBarrel" position={[-0.18, 1.68, -0.08]} quaternion={rotation}>
      <mesh position={[0, 1.28, 0]} material={barrel} castShadow>
        <cylinderGeometry args={[0.43, 0.38, 2.57, 18]} />
      </mesh>
      {[0.18, 0.75, 1.65, 2.48].map((height) => <mesh key={height} position={[0, height, 0]}
        rotation={[-Math.PI / 2, 0, 0]} material={housing} castShadow>
        <torusGeometry args={[0.42, 0.07, 8, 24]} />
      </mesh>)}
      <mesh position={[0, 2.58, 0]} rotation={[-Math.PI / 2, 0, 0]} material={collar}>
        <torusGeometry args={[0.41, 0.1, 8, 24]} />
      </mesh>
      <mesh position={[0, 2.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 24]} />
        <meshBasicMaterial color="#78D8F5" toneMapped={false} />
      </mesh>
    </group>
    <group name="Eyepiece" position={[0.53, 1.58, 0.67]}>
      <Strut from={[-0.54, 0.14, -0.63]} to={[0, 0, 0]} radius={0.16} />
      <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]} material={housing} castShadow>
        <cylinderGeometry args={[0.2, 0.16, 0.45, 12]} />
      </mesh>
      <mesh position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]} material={collar}>
        <torusGeometry args={[0.19, 0.055, 7, 16]} />
      </mesh>
      <mesh position={[0, 0, 0.43]}>
        <circleGeometry args={[0.16, 16]} />
        <meshBasicMaterial color="#B1E9F6" toneMapped={false} />
      </mesh>
    </group>
  </group>;
}
