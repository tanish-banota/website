import { paint } from './palette';

export function ObservatoryFallback() {
  return <group>
    <mesh position={[0, -0.2, 0]} receiveShadow><cylinderGeometry args={[4.25, 4.25, 0.4, 20]} /><meshStandardMaterial color={paint.cream} /></mesh>
    <mesh position={[0, 0.95, -1.2]} castShadow><boxGeometry args={[1, 1.9, 1.1]} /><meshStandardMaterial color={paint.steel} /></mesh>
    <mesh position={[0, 1.2, 3.45]}><boxGeometry args={[2.35, 2.4, 0.3]} /><meshStandardMaterial color={paint.blue} /></mesh>
  </group>;
}
