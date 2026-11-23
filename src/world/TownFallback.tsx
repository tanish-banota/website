import { paint } from './palette';
import { northLookout } from './collision';

export function TownFallback() {
  return <group>
    <mesh position={[0, -0.43, 0]} receiveShadow><boxGeometry args={[70, 0.86, 70]} /><meshStandardMaterial color={paint.grass} /></mesh>
    <mesh position={[0, 2.45, -3.7]}><boxGeometry args={[3.4, 4.9, 2.38]} /><meshStandardMaterial color={paint.cream} /></mesh>
    <mesh position={[0, 0.3, 1.35]}><cylinderGeometry args={[1.3, 1.35, 0.6, 20]} /><meshStandardMaterial color={paint.stoneShade} /></mesh>
    <mesh position={[-6.5, 1.55, 2.15]}><boxGeometry args={[2.5, 1.35, 0.22]} /><meshStandardMaterial color={paint.blue} /></mesh>
    <mesh position={[6.5, 1.5, -1.65]}><boxGeometry args={[4.3, 3, 3.1]} /><meshStandardMaterial color={paint.cream} /></mesh>
    <mesh position={[7.4, 0.73, 4.65]}><boxGeometry args={[0.8, 1.45, 0.64]} /><meshStandardMaterial color={paint.blue} /></mesh>
    <mesh position={[-8.3, 0.71, -6.45]}><cylinderGeometry args={[2.22, 2.3, 1.16, 12]} /><meshStandardMaterial color={paint.blue} /></mesh>
    <mesh position={[-8.3, 1.9, -6.45]}><coneGeometry args={[2.2, 1.6, 12]} /><meshStandardMaterial color={paint.steel} /></mesh>
    <mesh position={[-8.3, 0.7, -3.94]}><boxGeometry args={[0.9, 1.4, 0.12]} /><meshStandardMaterial color={paint.blue} /></mesh>
    <mesh position={[northLookout.x, 0.06, northLookout.z]}><cylinderGeometry args={[1.85, 1.95, 0.12, 20]} /><meshStandardMaterial color={paint.stoneShade} /></mesh>
  </group>;
}
