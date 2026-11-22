import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Matrix4, Mesh } from 'three';
import type { Group, Material, Object3D } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Material identity includes maps, alpha settings, shader hooks, and every
// other property that affects rendering. Only explicitly shared materials batch.
function keyFor(mesh: Mesh) {
  return `${(mesh.material as Material).uuid}:${mesh.castShadow}:${mesh.receiveShadow}`;
}

function sectionFor(mesh: Mesh, root: Group): Object3D {
  let section = mesh.parent;
  while (section && section !== root && !section.name) section = section.parent;
  return section ?? root;
}

function shareableKey(material: Material): string | null {
  if (!['MeshStandardMaterial', 'MeshBasicMaterial'].includes(material.type) ||
      material.transparent || material.opacity !== 1 || material.alphaTest !== 0 ||
      Object.hasOwn(material, 'onBeforeCompile') || Object.hasOwn(material, 'customProgramCacheKey') ||
      Object.values(material).some((value) => value && typeof value === 'object' && 'isTexture' in value) ||
      Object.keys(material.userData).length) return null;
  const description: Record<string, unknown> = { ...material.toJSON() };
  delete description.uuid;
  delete description.metadata;
  return JSON.stringify(description);
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
    const shared = new Map<string, Material>();
    const original = new Map<Mesh, Material>();
    group.traverse((object) => {
      if (!(object instanceof Mesh) || Array.isArray(object.material)) return;
      const material = object.material as Material;
      const signature = shareableKey(material);
      if (signature) {
        const canonical = shared.get(signature);
        if (canonical && canonical !== material) {
          original.set(object, material);
          object.material = canonical;
        } else shared.set(signature, material);
      }
      object.name = object.castShadow ? 'casts-shadow' : 'receives-only';
      // Keep each named landmark intact for a future GLB replacement.
      const key = `${sectionFor(object, group).uuid}:${keyFor(object)}`;
      buckets.set(key, [...(buckets.get(key) ?? []), object]);
    });
    const batches: Mesh[] = [];
    for (const meshes of buckets.values()) {
      if (meshes.length < 2) continue;
      const section = sectionFor(meshes[0], group);
      const inverseSection = new Matrix4().copy(section.matrixWorld).invert();
      const geometries = meshes.map((mesh) => mesh.geometry.clone().applyMatrix4(new Matrix4().multiplyMatrices(inverseSection, mesh.matrixWorld)));
      const merged = mergeGeometries(geometries, false);
      geometries.forEach((geometry) => { geometry.dispose(); });
      if (!merged) continue;
      const batch = new Mesh(merged, meshes[0].material);
      batch.name = meshes[0].name;
      batch.castShadow = meshes[0].castShadow;
      batch.receiveShadow = meshes[0].receiveShadow;
      meshes.forEach((mesh) => { mesh.visible = false; });
      section.add(batch);
      batches.push(batch);
    }
    if (import.meta.env.DEV) (window as Window & { __twilightTownKit?: Group }).__twilightTownKit = group;
    return () => {
      if (import.meta.env.DEV) delete (window as Window & { __twilightTownKit?: Group }).__twilightTownKit;
      for (const batch of batches) { batch.parent?.remove(batch); batch.geometry.dispose(); }
      for (const meshes of buckets.values()) meshes.forEach((mesh) => { mesh.visible = true; });
      for (const [mesh, material] of original) mesh.material = material;
    };
  }, []);
  return <group ref={root}>{children}</group>;
}
