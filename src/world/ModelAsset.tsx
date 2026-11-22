import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Mesh } from 'three';

export function ModelAsset({ file }: { file: 'town.glb' | 'observatory.glb' }) {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/${file}`);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return copy;
  }, [scene]);
  return <primitive object={model} />;
}
