import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Point } from './collision';
import { anchors, nearestAnchor } from './interactions';
import type { Anchor, PanelId, SceneId } from './interactions';
import { isUiTarget } from './useInput';

export function InteractionTracker({ position, scene, enabled, onNearestChange, onActivate }: {
  position: MutableRefObject<Point>;
  scene: SceneId;
  enabled: boolean;
  onNearestChange: (anchor: Anchor | null) => void;
  onActivate: (panel: PanelId) => void;
}) {
  const current = useRef<Anchor | null>(null);

  useEffect(() => {
    current.current = null;
    onNearestChange(null);
  }, [scene, onNearestChange]);

  useFrame(() => {
    if (!enabled) return;
    const next = nearestAnchor(position.current.x, position.current.z, scene, anchors);
    if (next?.id === current.current?.id) return;
    current.current = next;
    onNearestChange(next);
  });

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'e' || event.repeat || isUiTarget(event.target) || document.querySelector('dialog[open]')) return;
      const target = current.current;
      if (target) onActivate(target.target);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onActivate]);

  return null;
}
