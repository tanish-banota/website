import { paint } from './palette';
export function ObservatoryExterior() {
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
      <mesh position={[0, 2.13, 0]}><torusGeometry args={[2.25, 0.08, 6, 32]} /><meshStandardMaterial color={paint.blue} /></mesh>
      <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[2.43, 2.43, 0.35, 20]} /><meshStandardMaterial color={paint.stoneShade} /></mesh>
      <mesh position={[0, 2.8, 1.68]} rotation={[-0.4, 0, 0]}><boxGeometry args={[0.2, 1.35, 0.12]} /><meshStandardMaterial color={paint.blue} /></mesh>
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


