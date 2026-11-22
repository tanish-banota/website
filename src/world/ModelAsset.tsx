import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Mesh } from 'three';

export function ModelAsset({ file }: { file: 'town.glb' | 'observatory.glb' }) {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/${file}`);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = file === 'town.glb' ? object.name === 'casts-shadow' : true;
        // The town's buildings cast onto the terrain, but do not sample the
        // shadow map on their own walls and foundations. That avoids the
        // camera-dependent dark shimmer at the two rear house bases.
        object.receiveShadow = file === 'town.glb' ? object.name === 'receives-only' : true;
      }
    });
    return copy;
  }, [scene, file]);
  return <primitive object={model} />;
}
