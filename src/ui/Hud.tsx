import type { Anchor } from '../world/interactions';

export function Hud({ nearest }: { nearest: Anchor | null }) {
  return (
    <div className="interaction-prompt" role="status" aria-live="polite" aria-atomic="true">
      {nearest && <p><kbd>E</kbd><span>{nearest.label}</span></p>}
    </div>
  );
}
