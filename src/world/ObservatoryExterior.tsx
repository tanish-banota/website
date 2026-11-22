import { useMemo } from 'react';
import { CatmullRomCurve3, DoubleSide, MeshStandardMaterial, Quaternion, TubeGeometry, Vector3 } from 'three';
import type { DomeEdge } from './observatoryDome';
import { createObservatoryDome, panelGeometry } from './observatoryDome';
import { paint } from './palette';

export const observatoryExteriorPosition: [number, number, number] = [-8.3, 0, -6.45];

function TriangulatedDome() {
  const surface = useMemo(createObservatoryDome, []);
  const panels = useMemo(() => surface.triangles.map((triangle) => panelGeometry(surface.vertices, triangle)), [surface]);
  const panelMaterials = useMemo(() => ['#263750', '#304A72', '#51477C', '#365681'].map((color) =>
    new MeshStandardMaterial({ color, roughness: 0.43, metalness: 0.16, side: DoubleSide })), []);
  const ribMaterial = useMemo(() => new MeshStandardMaterial({ color: '#17283E', roughness: 0.77, metalness: 0.07 }), []);
  return <group name="TriangulatedDome">
    <group name="DomePanels">
      {panels.map((geometry, index) => <mesh key={surface.triangles[index].join(':')} geometry={geometry}
        material={panelMaterials[(index * 7 + Math.floor(index / 12)) % panelMaterials.length]} castShadow />)}
    </group>
    <group name="DomeRibs">
      {surface.edges.map((edge) => <DomeRib key={edge.join(':')} edge={edge}
        vertices={surface.vertices} material={ribMaterial} />)}
    </group>
  </group>;
}

function DomeRib({ edge, vertices, material }: { edge: DomeEdge; vertices: Vector3[]; material: MeshStandardMaterial }) {
  const start = vertices[edge[0]];
  const end = vertices[edge[1]];
  const direction = useMemo(() => new Vector3().subVectors(end, start), [start, end]);
  const center = useMemo(() => new Vector3().addVectors(start, end).multiplyScalar(0.5), [start, end]);
  const quaternion = useMemo(() => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize()), [direction]);
  return <mesh position={center} quaternion={quaternion} material={material} castShadow>
    <cylinderGeometry args={[0.045, 0.045, direction.length(), 5]} />
  </mesh>;
}

function TelescopeSupport() {
  const helix = useMemo(() => {
    const points = Array.from({ length: 20 }, (_, index) => {
      const t = index / 19;
      const angle = t * Math.PI * 3;
      const radius = 0.72 - t * 0.24;
      return new Vector3(Math.sin(angle) * radius, 2.94 + t * 0.85, Math.cos(angle) * radius);
    });
    return new TubeGeometry(new CatmullRomCurve3(points), 48, 0.065, 6, false);
  }, []);
  return <group name="TelescopeSupport">
    <mesh position={[0, 3.28, 0]} castShadow>
      <cylinderGeometry args={[0.14, 0.2, 0.76, 10]} />
      <meshStandardMaterial color={paint.blue} roughness={0.8} />
    </mesh>
    <mesh geometry={helix} castShadow>
      <meshStandardMaterial color="#4D536A" roughness={0.69} metalness={0.12} />
    </mesh>
    <mesh position={[0, 3.79, 0]} castShadow>
      <sphereGeometry args={[0.26, 12, 8]} />
      <meshStandardMaterial color="#17283E" roughness={0.67} metalness={0.11} />
    </mesh>
  </group>;
}

function RoofTelescope() {
  const direction = useMemo(() => new Vector3(-0.75, 0.68, 0.35).normalize(), []);
  const quaternion = useMemo(() => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction), [direction]);
  return <group name="RoofTelescope" position={[0.15, 3.59, -0.1]} quaternion={quaternion}>
    <mesh position={[0, 1.29, 0]} castShadow>
      <cylinderGeometry args={[0.42, 0.47, 2.45, 16]} />
      <meshStandardMaterial color={paint.steel} roughness={0.59} metalness={0.17} />
    </mesh>
    {[0.25, 0.91, 1.65, 2.38].map((height) => <mesh key={height}
      position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
      <torusGeometry args={[0.46, 0.09, 7, 20]} />
      <meshStandardMaterial color={paint.blue} roughness={0.74} metalness={0.1} />
    </mesh>)}
    <mesh position={[0, 2.56, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.39, 24]} />
      <meshStandardMaterial color="#5BBBEF" emissive="#136EA9" emissiveIntensity={0.8}
        roughness={0.18} metalness={0.14} side={DoubleSide} />
    </mesh>
    <mesh position={[0, 2.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.43, 0.075, 8, 24]} />
      <meshStandardMaterial color="#D8CCBC" roughness={0.52} metalness={0.15} />
    </mesh>
    <mesh position={[0, 0.08, 0]} castShadow>
      <cylinderGeometry args={[0.47, 0.33, 0.25, 12]} />
      <meshStandardMaterial color="#17283E" roughness={0.75} />
    </mesh>
  </group>;
}

function ObservatoryDoor() {
  return <group name="ObservatoryDoor" position={[0, 0, 2.21]}>
    <mesh position={[0, 0.7, 0.08]} castShadow>
      <boxGeometry args={[1.16, 1.42, 0.38]} />
      <meshStandardMaterial color="#17283E" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.69, 0.29]}>
      <boxGeometry args={[0.74, 1.25, 0.03]} />
      <meshStandardMaterial color={paint.blue} roughness={0.8} />
    </mesh>
    {[-0.52, 0.52].map((x) => <mesh key={x} position={[x, 0.73, 0.31]} castShadow>
      <boxGeometry args={[0.14, 1.46, 0.12]} />
      <meshStandardMaterial color="#B79B64" roughness={0.64} metalness={0.13} />
    </mesh>)}
    <mesh position={[0, 1.47, 0.31]} castShadow>
      <boxGeometry args={[1.17, 0.15, 0.14]} />
      <meshStandardMaterial color="#B79B64" roughness={0.64} metalness={0.13} />
    </mesh>
    <mesh position={[0.25, 0.72, 0.32]}>
      <sphereGeometry args={[0.045, 8, 6]} />
      <meshStandardMaterial color={paint.gold} metalness={0.2} roughness={0.48} />
    </mesh>
  </group>;
}

export function ObservatoryExterior() {
  return <group position={observatoryExteriorPosition}>
    <group name="ObservatoryBase">
      <mesh position={[0, 0.13, 0]} castShadow>
        <cylinderGeometry args={[2.36, 2.42, 0.25, 12]} />
        <meshStandardMaterial color="#B79B64" roughness={0.64} metalness={0.13} flatShading />
      </mesh>
      <mesh position={[0, 0.71, 0]} castShadow>
        <cylinderGeometry args={[2.22, 2.3, 1.16, 12]} />
        <meshStandardMaterial color={paint.blue} roughness={0.78} flatShading />
      </mesh>
      <mesh position={[0, 1.28, 0]} castShadow>
        <cylinderGeometry args={[2.28, 2.28, 0.12, 12]} />
        <meshStandardMaterial color="#B79B64" roughness={0.65} metalness={0.12} flatShading />
      </mesh>
    </group>
    <TriangulatedDome />
    <ObservatoryDoor />
    <TelescopeSupport />
    <RoofTelescope />
  </group>;
}
