import type { ProjectId } from '../data/portfolio';

export type SceneId = 'town' | 'observatory';
export type PanelId = 'about' | 'experience' | 'contact' | ProjectId;
export type Destination = { type: 'panel'; id: PanelId } | { type: 'scene'; id: SceneId } | { type: 'lookout' };

export type Anchor = {
  id: string;
  scene: SceneId;
  x: number;
  z: number;
  radius: number;
  label: string;
  target: Destination;
};

// Anchors sit on reachable ground in front of their landmark.
export const anchors: Anchor[] = [
  { id: 'clock-square', scene: 'town', x: 0, z: 3.55, radius: 0.9, label: 'About Tanish', target: { type: 'panel', id: 'about' } },
  { id: 'notice-board', scene: 'town', x: -6.5, z: 3.1, radius: 1.1, label: 'Event Finder', target: { type: 'panel', id: 'event-finder' } },
  { id: 'town-hall', scene: 'town', x: 6.5, z: 0.65, radius: 1.2, label: 'Experience', target: { type: 'panel', id: 'experience' } },
  { id: 'post-box', scene: 'town', x: 7.4, z: 5.55, radius: 1.05, label: 'Contact', target: { type: 'panel', id: 'contact' } },
  { id: 'observatory-door', scene: 'town', x: -8.3, z: -3.32, radius: 0.82, label: 'Enter observatory', target: { type: 'scene', id: 'observatory' } },
  { id: 'north-lookout', scene: 'town', x: 0, z: -8.8, radius: 0.85, label: 'Look at the moon', target: { type: 'lookout' } },
  { id: 'telescope', scene: 'observatory', x: -0.37, z: 0.34, radius: 0.78, label: 'Use telescope', target: { type: 'panel', id: 'tranquility-base' } },
  { id: 'observatory-exit', scene: 'observatory', x: 0, z: 2.35, radius: 0.75, label: 'Exit observatory', target: { type: 'scene', id: 'town' } },
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
