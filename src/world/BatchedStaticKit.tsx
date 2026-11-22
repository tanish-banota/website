import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Mesh } from 'three';
import type { Group, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

type KitMaterial = MeshBasicMaterial | MeshStandardMaterial;

function keyFor(mesh: Mesh) {
  const material = mesh.material as KitMaterial;
  const standard = material as MeshStandardMaterial;
  return [material.type, material.color.getHexString(), standard.emissive?.getHexString() ?? '',
    standard.emissiveIntensity ?? 0, standard.roughness ?? 0, standard.metalness ?? 0,
    material.side, mesh.castShadow, mesh.receiveShadow].join(':');
}

// All art in this group is stationary. Batching changes rendering only; the
// movement system continues to use its independent, approved ground footprints.
export function BatchedStaticKit({ children }: { children: ReactNode }) {
  const root = useRef<Group>(null);
  useLayoutEffect(() => {
    const group = root.current;
    if (!group) return;
    group.updateWorldMatrix(true, true);
    const buckets = new Map<string, Mesh[]>();
    group.traverse((object) => {
      if (!(object instanceof Mesh) || Array.isArray(object.material)) return;
      object.name = object.castShadow ? 'casts-shadow' : 'receives-only';
      const key = keyFor(object);
      buckets.set(key, [...(buckets.get(key) ?? []), object]);
    });
    const batches: Mesh[] = [];
    for (const meshes of buckets.values()) {
      if (meshes.length < 2) continue;
      const geometries = meshes.map((mesh) => mesh.geometry.clone().applyMatrix4(mesh.matrixWorld));
      const merged = mergeGeometries(geometries, false);
      geometries.forEach((geometry) => { geometry.dispose(); });
      if (!merged) continue;
      const batch = new Mesh(merged, meshes[0].material);
      batch.name = meshes[0].name;
      batch.castShadow = meshes[0].castShadow;
      batch.receiveShadow = meshes[0].receiveShadow;
      meshes.forEach((mesh) => { mesh.visible = false; });
      group.add(batch);
      batches.push(batch);
    }
    if (import.meta.env.DEV) (window as Window & { __twilightTownKit?: Group }).__twilightTownKit = group;
    return () => {
      if (import.meta.env.DEV) delete (window as Window & { __twilightTownKit?: Group }).__twilightTownKit;
      for (const batch of batches) { group.remove(batch); batch.geometry.dispose(); }
      for (const meshes of buckets.values()) meshes.forEach((mesh) => { mesh.visible = true; });
    };
  }, []);
  return <group ref={root}>{children}</group>;
}
