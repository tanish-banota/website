import type { ProjectId } from '../data/portfolio';

export type SceneId = 'town' | 'observatory';
export type PanelId = 'about' | 'experience' | 'contact' | ProjectId;

export type Anchor = {
  id: string;
  scene: SceneId;
  x: number;
  z: number;
  radius: number;
  label: string;
  target: PanelId;
};

// Anchors are on reachable ground in front of town landmarks. The observatory
// interior and telescope anchor are reserved for Phase 5.
export const anchors: Anchor[] = [
  { id: 'clock-square', scene: 'town', x: 0, z: 2.5, radius: 1.35, label: 'About Tanish', target: 'about' },
  { id: 'notice-board', scene: 'town', x: -6.5, z: 3.1, radius: 1.1, label: 'Event Finder', target: 'event-finder' },
  { id: 'town-hall', scene: 'town', x: 6.5, z: 0.65, radius: 1.2, label: 'Experience', target: 'experience' },
  { id: 'post-box', scene: 'town', x: 7.4, z: 5.55, radius: 1.05, label: 'Contact', target: 'contact' },
];

export function nearestAnchor(x: number, z: number, scene: SceneId, candidates: Anchor[]): Anchor | null {
  let nearest: Anchor | null = null;
  let nearestDistance = Infinity;
  for (const anchor of candidates) {
    if (anchor.scene !== scene) continue;
    const distance = Math.hypot(x - anchor.x, z - anchor.z);
    if (distance <= anchor.radius && distance < nearestDistance) {
      nearest = anchor;
      nearestDistance = distance;
    }
  }
  return nearest;
}
