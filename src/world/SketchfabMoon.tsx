import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three';

const moonFile = `${import.meta.env.BASE_URL}models/majoras-moon.glb`;

export function SketchfabMoon({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF(moonFile);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    const bounds = new Box3().setFromObject(copy);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const scale = 8.5 / Math.max(size.x, size.y, size.z);
    copy.scale.setScalar(scale);
    copy.position.copy(center).multiplyScalar(-scale);
    copy.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = false;
      object.receiveShadow = false;
      if (object.material instanceof MeshStandardMaterial) {
        const material = object.material.clone();
        material.emissiveMap = null;
        material.emissive.set('#000000');
        material.color.set('#A0A0A4');
        material.roughness = 0.92;
        material.metalness = 0;
        object.material = material;
      }
    });
    return copy;
  }, [scene]);

  useEffect(() => () => {
    model.traverse((object) => {
      if (object instanceof Mesh && object.material instanceof MeshStandardMaterial) object.material.dispose();
    });
  }, [model]);

  return <group name="LookoutMoon" position={position} rotation={[0.18, -0.08, -0.05]}>
    <pointLight position={[-4, 6, 10]} intensity={20} distance={24} color="#D9D6D0" />
    <primitive object={model} />
  </group>;
}
