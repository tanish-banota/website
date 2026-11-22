import { paint } from './palette';
export function StoneCourse({ width, depth, y, thickness = 0.13 }: { width: number; depth: number; y: number; thickness?: number }) {
  return <mesh position={[0, y, 0]} castShadow receiveShadow>
    <boxGeometry args={[width + 0.12, thickness, depth + 0.12]} />
    <meshStandardMaterial color={paint.stoneShade} roughness={1} />
  </mesh>;
}

export function Window({ x, y, z }: { x: number; y: number; z: number }) {
  return <group position={[x, y, z]}>
    <mesh><boxGeometry args={[0.53, 0.73, 0.09]} /><meshStandardMaterial color={paint.blue} /></mesh>
    <mesh position={[0, 0, 0.052]}><boxGeometry args={[0.38, 0.56, 0.025]} /><meshStandardMaterial color={paint.gold} emissive={paint.gold} emissiveIntensity={0.45} /></mesh>
    <mesh position={[0, 0, 0.08]}><boxGeometry args={[0.055, 0.61, 0.03]} /><meshStandardMaterial color={paint.cream} /></mesh>
    <mesh position={[0, 0, 0.08]}><boxGeometry args={[0.42, 0.05, 0.03]} /><meshStandardMaterial color={paint.cream} /></mesh>
    <mesh position={[0, -0.4, 0.03]} castShadow><boxGeometry args={[0.66, 0.09, 0.2]} /><meshStandardMaterial color={paint.stoneShade} /></mesh>
  </group>;
}


