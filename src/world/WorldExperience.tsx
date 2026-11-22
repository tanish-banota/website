import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { portfolio } from '../data/portfolio';
import { Hud } from '../ui/Hud';
import { ProjectDialog } from '../ui/ProjectDialog';
import { WorldCanvas } from './WorldCanvas';
import { northLookout, observatorySpawn, townReturnSpawn, townSpawn } from './collision';
import type { Point } from './collision';
import type { Anchor, PanelId, SceneId } from './interactions';

type Transition = 'idle' | 'cover' | 'reveal';
const guideDismissedKey = 'twilight-town-guide-dismissed';

function guideWasDismissed() {
  try {
    return window.localStorage.getItem(guideDismissedKey) === 'true';
  } catch {
    return false;
  }
}

export default function WorldExperience({ onExit, onFatalError }: { onExit: () => void; onFatalError: () => void }) {
  const params = new URLSearchParams(window.location.search);
  const devScene = import.meta.env.DEV && (params.get('asset-export') === 'observatory' || params.get('preview') === 'observatory')
    ? 'observatory' : 'town';
  const preview = import.meta.env.DEV ? params.get('preview') : null;
  const previewSpawn = preview === 'style-sample' ? { x: 4.4, z: -4.4 }
    : preview === 'observatory-exterior' ? { x: -7, z: -3.5 }
      : preview === 'lookout' || preview === 'lookout-entry' ? northLookout : townSpawn;
  const [nearest, setNearest] = useState<Anchor | null>(null);
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [scene, setScene] = useState<SceneId>(devScene);
  const [spawn, setSpawn] = useState<Point>(devScene === 'town' ? previewSpawn : observatorySpawn);
  const [transition, setTransition] = useState<Transition>('idle');
  const [assetError, setAssetError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(() => !guideWasDismissed());
  const [lookoutActive, setLookoutActive] = useState(false);
  const [moonAssetFailed, setMoonAssetFailed] = useState(false);
  const worldMain = useRef<HTMLElement>(null);
  const lookoutReturn = useRef<HTMLButtonElement>(null);
  const pendingScene = useRef<SceneId | null>(null);

  const handleNearestChange = useCallback((next: Anchor | null) => {
    setNearest((current) => current?.id === next?.id ? current : next);
  }, []);
  const activateAnchor = useCallback((anchor: Anchor) => {
    if (anchor.target.type === 'lookout') {
      setNearest(null);
      setMoonAssetFailed(false);
      setLookoutActive(true);
      return;
    }
    if (anchor.target.type === 'panel') {
      setActivePanel(anchor.target.id);
      return;
    }
    const next = anchor.target.id;
    setLookoutActive(false);
    pendingScene.current = next;
    setNearest(null);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setScene(next);
      setSpawn(next === 'town' ? townReturnSpawn : observatorySpawn);
      setAssetError(false);
      pendingScene.current = null;
      return;
    }
    setTransition('cover');
  }, []);

  const handleFadeEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'opacity') return;
    if (transition === 'cover') {
      const next = pendingScene.current;
      if (next) {
        setScene(next);
        setSpawn(next === 'town' ? townReturnSpawn : observatorySpawn);
        setAssetError(false);
        pendingScene.current = null;
      }
      setTransition('reveal');
    } else if (transition === 'reveal') {
      setTransition('idle');
    }
  };

  useLayoutEffect(() => { worldMain.current?.focus({ preventScroll: true }); }, []);

  useEffect(() => {
    if (!lookoutActive) return;
    lookoutReturn.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setLookoutActive(false);
      requestAnimationFrame(() => worldMain.current?.focus({ preventScroll: true }));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lookoutActive]);

  const returnToTown = () => {
    setLookoutActive(false);
    requestAnimationFrame(() => worldMain.current?.focus({ preventScroll: true }));
  };

  const closeGuide = () => {
    setGuideOpen(false);
    try {
      window.localStorage.setItem(guideDismissedKey, 'true');
    } catch {
      // Keep the current view usable when storage is unavailable.
    }
    requestAnimationFrame(() => worldMain.current?.focus({ preventScroll: true }));
  };
  const showGuide = () => {
    setGuideOpen(true);
    requestAnimationFrame(() => worldMain.current?.focus({ preventScroll: true }));
  };

  return <>
    <main id="main-content" className={`world-view ${scene === 'observatory' ? 'interior' : ''} ${guideOpen ? '' : 'guide-closed'} ${lookoutActive ? 'lookout-mode' : ''}`} ref={worldMain} tabIndex={-1}>
      <WorldCanvas scene={scene} spawn={spawn} enabled={activePanel === null && transition === 'idle' && !lookoutActive}
        lookoutActive={lookoutActive && scene === 'town' && activePanel === null}
        onNearestChange={handleNearestChange} onOpenPanel={activateAnchor}
        onAssetError={() => setAssetError(true)} onMoonAssetError={() => setMoonAssetFailed(true)} onFatalError={onFatalError} />
      {lookoutActive ? <section className="lookout-controls" aria-label="Moon lookout">
        <p className="eyebrow">Northern lookout</p>
        <p>The moon hangs over the quiet town.</p>
        <button ref={lookoutReturn} type="button" onClick={returnToTown}>Return to town <span aria-hidden="true">· Esc</span></button>
        {moonAssetFailed ? <p className="lookout-credit" role="status">Moon detail could not load; showing the generated fallback.</p>
          : <p className="lookout-credit">Moon model by <a href="https://sketchfab.com/3d-models/the-legend-of-zelda-majoras-mask-3d-moon-062f9773cb5b43338a60780e1e61c4bc" target="_blank" rel="noopener noreferrer">Warrior364</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></p>}
      </section> : guideOpen ? <div className="world-overlay" id="town-guide">
        <button type="button" className="world-guide-close" onClick={closeGuide} aria-label="Close town guide">×</button>
        <p className="eyebrow">{portfolio.worldIntro[scene].eyebrow}</p>
        <h1>{portfolio.worldIntro[scene].title}</h1>
        <p>{portfolio.worldIntro[scene].description}</p>
        {assetError && <p role="status">Scene detail failed to load. Landmarks and interactions remain available.</p>}
        <button type="button" className="primary-button" onClick={onExit}>View portfolio</button>
      </div> : <button type="button" className="world-guide-reopen" onClick={showGuide}>Show town guide</button>}
      {activePanel === null && transition === 'idle' && !lookoutActive && <Hud nearest={nearest} />}
      <div className={`scene-fade ${transition}`} aria-hidden="true" onTransitionEnd={handleFadeEnd} />
    </main>
    <ProjectDialog panel={activePanel} onDismiss={() => setActivePanel(null)} />
  </>;
}
