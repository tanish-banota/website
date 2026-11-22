import { useLayoutEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Mesh } from 'three';
import type { Group, Object3D } from 'three';

export function ModelAsset({ file, lookoutOnly = false }: { file: 'town.glb' | 'observatory.glb'; lookoutOnly?: boolean }) {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/${file}`);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((object) => {
      if (object instanceof Mesh) {
        const shadow = object.userData.twilightShadow as { cast?: unknown; receive?: unknown } | undefined;
        // glTF omits Three.js shadow flags. Exported extras preserve the source
        // choices even when GLTFLoader suffixes duplicate mesh names.
        object.castShadow = typeof shadow?.cast === 'boolean' ? shadow.cast
          : file === 'town.glb' ? object.name.startsWith('casts-shadow') : true;
        object.receiveShadow = typeof shadow?.receive === 'boolean' ? shadow.receive
          : file === 'town.glb' ? object.name.startsWith('receives-only') : true;
      }
    });
    if (lookoutOnly && file === 'town.glb') {
      const lookout = copy.getObjectByName('NorthLookout');
      const kept = new Set<Object3D>();
      lookout?.traverse((object) => kept.add(object));
      for (let ancestor = lookout?.parent; ancestor; ancestor = ancestor.parent) kept.add(ancestor);
      copy.traverse((object) => { if (!kept.has(object)) object.visible = false; });
    }
    return copy;
  }, [scene, file, lookoutOnly]);
  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return;
    (window as Window & { __twilightRuntimeAsset?: Group }).__twilightRuntimeAsset = model;
    return () => { delete (window as Window & { __twilightRuntimeAsset?: Group }).__twilightRuntimeAsset; };
  }, [model]);
  return <primitive object={model} />;
}
