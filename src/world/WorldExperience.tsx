import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { portfolio } from '../data/portfolio';
import { Hud } from '../ui/Hud';
import { ProjectDialog } from '../ui/ProjectDialog';
import { WorldCanvas } from './WorldCanvas';
import { observatorySpawn, townReturnSpawn, townSpawn } from './collision';
import type { Point } from './collision';
import type { Anchor, PanelId, SceneId } from './interactions';

type Transition = 'idle' | 'cover' | 'reveal';

export default function WorldExperience({ onExit, onFatalError }: { onExit: () => void; onFatalError: () => void }) {
  const devScene = import.meta.env.DEV && /(?:asset-export|preview)=observatory/.test(window.location.search) ? 'observatory' : 'town';
  const sampleSpawn = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'style-sample'
    ? { x: 0.7, z: -3.6 } : townSpawn;
  const [nearest, setNearest] = useState<Anchor | null>(null);
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [scene, setScene] = useState<SceneId>(devScene);
  const [spawn, setSpawn] = useState<Point>(devScene === 'town' ? sampleSpawn : observatorySpawn);
  const [transition, setTransition] = useState<Transition>('idle');
  const [assetError, setAssetError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);
  const [moonVisible, setMoonVisible] = useState(false);
  const worldMain = useRef<HTMLElement>(null);
  const pendingScene = useRef<SceneId | null>(null);

  const handleNearestChange = useCallback((next: Anchor | null) => {
    setNearest((current) => current?.id === next?.id ? current : next);
    if (next?.id !== 'north-lookout') setMoonVisible(false);
  }, []);
  const activateAnchor = useCallback((anchor: Anchor) => {
    if (anchor.target.type === 'lookout') {
      setMoonVisible((visible) => !visible);
      return;
    }
    if (anchor.target.type === 'panel') {
      setActivePanel(anchor.target.id);
      return;
    }
    const next = anchor.target.id;
    setMoonVisible(false);
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

  const toggleGuide = () => {
    setGuideOpen((open) => !open);
    requestAnimationFrame(() => worldMain.current?.focus({ preventScroll: true }));
  };

  return <>
    <main id="main-content" className={`world-view ${scene === 'observatory' ? 'interior' : ''} ${guideOpen ? '' : 'guide-closed'}`} ref={worldMain} tabIndex={-1}>
      {scene === 'town' && moonVisible && <div className="world-moon" aria-hidden="true" />}
      <WorldCanvas scene={scene} spawn={spawn} enabled={activePanel === null && transition === 'idle'}
        onNearestChange={handleNearestChange} onOpenPanel={activateAnchor}
        onAssetError={() => setAssetError(true)} onFatalError={onFatalError} />
      {guideOpen ? <div className="world-overlay" id="town-guide">
        <button type="button" className="world-guide-close" onClick={toggleGuide} aria-label="Close town guide">×</button>
        <p className="eyebrow">{portfolio.worldIntro[scene].eyebrow}</p>
        <h1>{portfolio.worldIntro[scene].title}</h1>
        <p>{portfolio.worldIntro[scene].description}</p>
        {assetError && <p role="status">Scene detail failed to load. Landmarks and interactions remain available.</p>}
        <button type="button" className="primary-button" onClick={onExit}>View portfolio</button>
      </div> : <button type="button" className="world-guide-reopen" onClick={toggleGuide}>Show town guide</button>}
      {activePanel === null && transition === 'idle' && <Hud nearest={nearest} />}
      <div className={`scene-fade ${transition}`} aria-hidden="true" onTransitionEnd={handleFadeEnd} />
    </main>
    <ProjectDialog panel={activePanel} onDismiss={() => setActivePanel(null)} />
  </>;
}
