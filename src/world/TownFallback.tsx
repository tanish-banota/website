import { paint } from './palette';

export function TownFallback() {
  return <group>
    <mesh position={[0, -0.43, 0]} receiveShadow><boxGeometry args={[26, 0.86, 21]} /><meshStandardMaterial color={paint.grass} /></mesh>
    <mesh position={[0, 2.35, -1.7]}><boxGeometry args={[2.3, 4.7, 2.1]} /><meshStandardMaterial color={paint.cream} /></mesh>
    <mesh position={[-6.5, 1.55, 2.15]}><boxGeometry args={[2.5, 1.35, 0.22]} /><meshStandardMaterial color={paint.blue} /></mesh>
    <mesh position={[6.5, 1.5, -1.65]}><boxGeometry args={[4.3, 3, 3.1]} /><meshStandardMaterial color={paint.cream} /></mesh>
    <mesh position={[7.4, 0.73, 4.65]}><boxGeometry args={[0.8, 1.45, 0.64]} /><meshStandardMaterial color={paint.blue} /></mesh>
    <mesh position={[-8.3, 1.05, -6.45]}><cylinderGeometry args={[2.25, 2.35, 2.1, 16]} /><meshStandardMaterial color={paint.steel} /></mesh>
  </group>;
}
