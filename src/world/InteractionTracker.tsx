import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Point } from './collision';
import { anchors, nearestAnchor } from './interactions';
import type { Anchor, SceneId } from './interactions';
import { isUiTarget } from './useInput';

export function InteractionTracker({ position, scene, enabled, onNearestChange, onActivate }: {
  position: MutableRefObject<Point>;
  scene: SceneId;
  enabled: boolean;
  onNearestChange: (anchor: Anchor | null) => void;
  onActivate: (anchor: Anchor) => void;
}) {
  const current = useRef<Anchor | null>(null);
  const activationHeld = useRef(false);

  // Reset the prompt whenever tracking pauses or a scene changes.
  useEffect(() => {
    if (!enabled || current.current?.scene !== scene) {
      current.current = null;
      onNearestChange(null);
    }
  }, [scene, enabled, onNearestChange]);

  useFrame(() => {
    if (!enabled) return;
    const next = nearestAnchor(position.current.x, position.current.z, scene, anchors);
    if (next?.id === current.current?.id) return;
    current.current = next;
    onNearestChange(next);
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'e') return;
      if (event.repeat || activationHeld.current) return;
      activationHeld.current = true;
      if (!enabled || isUiTarget(event.target) || document.querySelector('dialog[open]')) return;
      const target = current.current;
      if (target) onActivate(target);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'e') activationHeld.current = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled, onActivate]);

  return null;
}
