import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import type { Group } from 'three';

export async function exportKit(name: 'Town' | 'Observatory') {
  const group = (window as Window & { __twilightTownKit?: Group; __twilightObservatoryKit?: Group })[
    name === 'Town' ? '__twilightTownKit' : '__twilightObservatoryKit'
  ];
  if (!group) throw new Error(`${name} kit is not mounted`);
  const result = await new GLTFExporter().parseAsync(group, { binary: true, onlyVisible: true });
  if (!(result instanceof ArrayBuffer)) throw new Error('Expected binary GLB');
  const bytes = new Uint8Array(result);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 8192) binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
  return btoa(binary);
}
