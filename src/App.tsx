import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { portfolio } from './data/portfolio';
import { Hud } from './ui/Hud';
import { Portfolio } from './ui/Portfolio';
import { ProjectDialog } from './ui/ProjectDialog';
import { WorldCanvas } from './world/WorldCanvas';
import { observatorySpawn, townReturnSpawn, townSpawn } from './world/collision';
import type { Point } from './world/collision';
import type { Anchor, PanelId, SceneId } from './world/interactions';

type View = 'portfolio' | 'world';
type Transition = 'idle' | 'cover' | 'reveal';

export default function App() {
  const [view, setView] = useState<View>('portfolio');
  const [nearest, setNearest] = useState<Anchor | null>(null);
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [scene, setScene] = useState<SceneId>('town');
  const [spawn, setSpawn] = useState<Point>(townSpawn);
  const [transition, setTransition] = useState<Transition>('idle');
  const [interiorError, setInteriorError] = useState(false);
  const isWorld = view === 'world';
  const worldMain = useRef<HTMLElement>(null);
  const pendingScene = useRef<SceneId | null>(null);

  const showPortfolio = () => {
    setActivePanel(null);
    setNearest(null);
    setScene('town');
    setSpawn(townSpawn);
    setTransition('idle');
    pendingScene.current = null;
    setView('portfolio');
  };
  const handleNearestChange = useCallback((next: Anchor | null) => {
    setNearest((current) => current?.id === next?.id ? current : next);
  }, []);
  const activateAnchor = useCallback((anchor: Anchor) => {
    if (anchor.target.type === 'panel') {
      setActivePanel(anchor.target.id);
      return;
    }
    const next = anchor.target.id;
    pendingScene.current = next;
    setNearest(null);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setScene(next);
      setSpawn(next === 'town' ? townReturnSpawn : observatorySpawn);
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
        if (next === 'observatory') setInteriorError(false);
        pendingScene.current = null;
      }
      setTransition('reveal');
    } else if (transition === 'reveal') {
      setTransition('idle');
    }
  };

  useLayoutEffect(() => {
    if (isWorld) worldMain.current?.focus({ preventScroll: true });
  }, [isWorld]);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <a className="brand" href="#about" onClick={showPortfolio} aria-label={`${portfolio.name}, portfolio home`}>
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>{portfolio.name}</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#about" onClick={showPortfolio}>About</a>
          <a href="#projects" onClick={showPortfolio}>Projects</a>
          <a href="#experience" onClick={showPortfolio}>Experience</a>
          <a href="#contact" onClick={showPortfolio}>Contact</a>
        </nav>
        <div className="view-switch" aria-label="Choose view">
          <button type="button" aria-pressed={!isWorld} onClick={showPortfolio}>View portfolio</button>
          <button type="button" aria-pressed={isWorld} onClick={() => setView('world')}>Explore town</button>
        </div>
      </header>
      {isWorld ? (
        <main id="main-content" className={`world-view ${scene === 'observatory' ? 'interior' : ''}`} ref={worldMain} tabIndex={-1}>
          <div className="world-moon" aria-hidden="true" />
          <WorldCanvas
            scene={scene}
            spawn={spawn}
            enabled={activePanel === null && transition === 'idle'}
            onNearestChange={handleNearestChange}
            onOpenPanel={activateAnchor}
            onInteriorError={() => setInteriorError(true)}
          />
          <div className="world-overlay">
            <p className="eyebrow">{portfolio.worldIntro[scene].eyebrow}</p>
            <h1>{portfolio.worldIntro[scene].title}</h1>
            <p>{portfolio.worldIntro[scene].description}</p>
            {scene === 'observatory' && interiorError && <p role="status">Interior detail failed to load. You can still use the telescope or exit.</p>}
            <button type="button" className="primary-button" onClick={showPortfolio}>View portfolio</button>
          </div>
          {activePanel === null && transition === 'idle' && <Hud nearest={nearest} />}
          <div className={`scene-fade ${transition}`} aria-hidden="true" onTransitionEnd={handleFadeEnd} />
        </main>
      ) : <Portfolio />}
      {isWorld && <ProjectDialog panel={activePanel} onDismiss={() => setActivePanel(null)} />}
      <footer className="site-footer"><span>{portfolio.name}</span><span>Built for a quiet twilight.</span></footer>
    </div>
  );
}
