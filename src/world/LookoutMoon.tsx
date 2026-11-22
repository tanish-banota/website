import { useMemo } from 'react';
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, SphereGeometry, TubeGeometry, Vector3 } from 'three';

export type MoonFaceProportions = {
  radius: number;
  eyeSpacing: number;
  eyeWidth: number;
  browWeight: number;
  grinWidth: number;
  grinDepth: number;
  noseLength: number;
};

export const moonFace: MoonFaceProportions = {
  radius: 4.2,
  eyeSpacing: 1.28,
  eyeWidth: 0.83,
  browWeight: 0.23,
  grinWidth: 2.22,
  grinDepth: 0.88,
  noseLength: 1.08,
};

const gauss = (x: number, y: number, centerX: number, centerY: number, width: number, height: number) =>
  Math.exp(-(((x - centerX) / width) ** 2 + ((y - centerY) / height) ** 2));

function surfaceZ(x: number, y: number, radius: number) {
  return Math.sqrt(Math.max(0.1, radius * radius - x * x - y * y));
}

function sculptedMoon(face: MoonFaceProportions) {
  const geometry = new SphereGeometry(face.radius, 96, 64);
  const position = geometry.getAttribute('position');
  const colors: number[] = [];
  const base = new Color('#898A90');
  const craters = [
    [-0.68, 0.5, 0.16], [0.67, 0.48, 0.18], [-0.72, -0.23, 0.13],
    [0.73, -0.16, 0.12], [-0.42, -0.72, 0.1], [0.43, -0.7, 0.14],
    [0.05, 0.87, 0.11], [-0.14, -0.9, 0.13],
  ];
  for (let index = 0; index < position.count; index++) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const direction = new Vector3(x, y, z).normalize();
    let displacement = 0.06 * Math.sin(x * 3.4 + y * 1.8) * Math.cos(y * 4.1 - z * 2.7);
    displacement += 0.035 * Math.sin(x * 8.1 + z * 3.8) * Math.sin(y * 6.3);
    let craterShade = 0;
    for (const [cx, cy, size] of craters) {
      const distance = Math.hypot(direction.x - cx, direction.y - cy);
      const bowl = Math.exp(-((distance / size) ** 2) * 1.8);
      const rim = Math.exp(-(((distance - size * 0.93) / (size * 0.25)) ** 2));
      displacement += -0.24 * bowl + 0.075 * rim;
      craterShade += bowl * 0.13;
    }
    if (z > 0) {
      for (const side of [-1, 1]) {
        displacement -= 0.67 * gauss(x, y, side * face.eyeSpacing, 0.43, face.eyeWidth * 1.12, 0.57);
        displacement += 0.35 * gauss(x, y, side * face.eyeSpacing, 1.08, 1.12, 0.36);
        displacement += 0.12 * gauss(x, y, side * 2.12, -0.55, 0.58, 0.65);
      }
      const grinY = -1.12 + 0.24 * (x / face.grinWidth) ** 2;
      displacement -= 0.34 * gauss(x, y, 0, grinY - 0.28, face.grinWidth * 0.86, 0.54);
      displacement += 0.24 * gauss(x, y, 0, -0.06, 0.46, 0.8);
    }
    const radius = face.radius + displacement;
    position.setXYZ(index, direction.x * radius, direction.y * radius, direction.z * radius);
    const shade = 0.94 + 0.055 * Math.sin(x * 4.3 + y * 2.5) * Math.cos(z * 3.2 - y * 4.7) - craterShade;
    const color = base.clone().multiplyScalar(shade);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  geometry.computeVertexNormals();
  return geometry;
}

function grinGeometry(face: MoonFaceProportions) {
  const positions: number[] = [];
  const indices: number[] = [];
  const segments = 40;
  for (let index = 0; index <= segments; index++) {
    const x = face.grinWidth * (index / segments * 2 - 1);
    const t = Math.abs(x / face.grinWidth);
    const upper = -1.08 + 0.35 * t * t;
    const lower = upper - face.grinDepth * Math.max(0, 1 - t * t) ** 0.8;
    positions.push(x, upper, surfaceZ(x, upper, face.radius) + 0.035);
    positions.push(x, lower, surfaceZ(x, lower, face.radius) + 0.055);
    if (index < segments) {
      const a = index * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function toothGeometry(face: MoonFaceProportions, index: number) {
  const count = 11;
  const x = (index - (count - 1) / 2) * 0.36;
  const t = Math.abs(x / face.grinWidth);
  const top = -1.12 + 0.35 * t * t;
  const height = (0.35 + [0.12, 0.2, 0.06, 0.25, 0.14][index % 5]) * (1 - 0.35 * t);
  const width = 0.29 + (index % 3) * 0.025;
  const left = x - width / 2;
  const right = x + width / 2;
  const bottom = top - height;
  const positions = new Float32Array([
    left, top, surfaceZ(left, top, face.radius) + 0.11,
    right, top, surfaceZ(right, top, face.radius) + 0.11,
    x + 0.085, bottom, surfaceZ(x + 0.085, bottom, face.radius) + 0.12,
    x - 0.07, bottom + (index % 2) * 0.055, surfaceZ(x - 0.07, bottom, face.radius) + 0.12,
  ]);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  return geometry;
}

function browGeometry(face: MoonFaceProportions, side: number) {
  const points = [-1, -0.5, 0, 0.5, 1].map((step) => {
    const x = side * face.eyeSpacing + step * 0.94;
    const y = 0.98 + 0.2 * Math.abs(step) + 0.17 * side * step;
    return new Vector3(x, y, surfaceZ(x, y, face.radius) + 0.12);
  });
  return new TubeGeometry(new CatmullRomCurve3(points), 24, face.browWeight, 8, false);
}

export function LookoutMoon({ position = [0, 9.5, -32], face = moonFace }: {
  position?: [number, number, number];
  face?: MoonFaceProportions;
}) {
  const body = useMemo(() => sculptedMoon(face), [face]);
  const mouth = useMemo(() => grinGeometry(face), [face]);
  const teeth = useMemo(() => Array.from({ length: 11 }, (_, index) => toothGeometry(face, index)), [face]);
  const brows = useMemo(() => [-1, 1].map((side) => browGeometry(face, side)), [face]);
  return <group name="LookoutMoon" position={position} scale={0.87}>
    <pointLight position={[-3, 5, 9]} intensity={54} distance={19} color="#D7D9E2" />
    <mesh name="SculptedMoonSurface" geometry={body}>
      <meshStandardMaterial vertexColors roughness={0.96} metalness={0} />
    </mesh>
    {[-1, 1].map((side, index) => <group key={side}>
      <mesh position={[side * face.eyeSpacing, 0.43, 3.46]} scale={[face.eyeWidth * 1.1, 0.5, 0.16]}>
        <sphereGeometry args={[1, 32, 16]} /><meshStandardMaterial color="#272831" roughness={1} />
      </mesh>
      <mesh position={[side * face.eyeSpacing, 0.39, 3.6]} scale={[0.43, 0.24, 0.12]} rotation={[0, 0, -side * 0.12]}>
        <sphereGeometry args={[1, 24, 12]} /><meshStandardMaterial color="#E9A73A" emissive="#A94F10" emissiveIntensity={0.32} roughness={0.57} />
      </mesh>
      <mesh position={[side * face.eyeSpacing, 0.38, 3.72]} scale={[0.11, 0.23, 0.06]}>
        <sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color="#1B2029" roughness={0.8} />
      </mesh>
      <mesh geometry={brows[index]}><meshStandardMaterial color="#77777D" roughness={0.96} /></mesh>
    </group>)}
    <mesh position={[0, -0.22, 4.42]} rotation={[0, 0, Math.PI]} scale={[1, face.noseLength / 1.08, 0.9]}>
      <coneGeometry args={[0.48, 1.08, 5]} /><meshStandardMaterial color="#929397" roughness={0.98} />
    </mesh>
    {[-1, 1].map((side) => <mesh key={side} position={[side * 0.18, -0.64, 4.55]} scale={[0.09, 0.055, 0.035]}>
      <sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color="#55555D" roughness={1} />
    </mesh>)}
    <mesh name="CarvedGrin" geometry={mouth}>
      <meshStandardMaterial color="#25262E" roughness={1} side={DoubleSide} />
    </mesh>
    {teeth.map((tooth, index) => <mesh key={tooth.uuid} geometry={tooth}>
      <meshStandardMaterial color={index % 3 === 0 ? '#C8C5BD' : '#E2DED1'} roughness={0.95} side={DoubleSide} />
    </mesh>)}
  </group>;
}
