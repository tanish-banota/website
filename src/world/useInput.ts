import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

export type HeldKeys = { up: boolean; down: boolean; left: boolean; right: boolean };

function isUiTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, button, a, [contenteditable], dialog'));
}

export function useInput(enabled: boolean): MutableRefObject<HeldKeys> {
  const held = useRef<HeldKeys>({ up: false, down: false, left: false, right: false });

  useEffect(() => {
    const clear = () => {
      held.current.up = false;
      held.current.down = false;
      held.current.left = false;
      held.current.right = false;
    };
    if (!enabled) {
      clear();
      return;
    }

    const update = (event: KeyboardEvent, pressed: boolean) => {
      if (document.querySelector('dialog[open]') || isUiTarget(event.target)) {
        clear();
        return;
      }
      const key = event.key.toLowerCase();
      const direction = key === 'w' || key === 'arrowup' ? 'up'
        : key === 's' || key === 'arrowdown' ? 'down'
          : key === 'a' || key === 'arrowleft' ? 'left'
            : key === 'd' || key === 'arrowright' ? 'right'
              : null;
      if (!direction) return;
      if (key.startsWith('arrow')) event.preventDefault();
      held.current[direction] = pressed;
    };
    const onKeyDown = (event: KeyboardEvent) => update(event, true);
    const onKeyUp = (event: KeyboardEvent) => update(event, false);
    const onFocusIn = (event: FocusEvent) => { if (isUiTarget(event.target)) clear(); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clear);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clear);
      document.removeEventListener('focusin', onFocusIn);
      clear();
    };
  }, [enabled]);

  return held;
}
