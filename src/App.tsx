import { useCallback, useEffect, useRef, useState } from 'react';
import { portfolio } from './data/portfolio';
import { Hud } from './ui/Hud';
import { Portfolio } from './ui/Portfolio';
import { ProjectDialog } from './ui/ProjectDialog';
import { WorldCanvas } from './world/WorldCanvas';
import type { Anchor, PanelId, SceneId } from './world/interactions';

type View = 'portfolio' | 'world';

export default function App() {
  const [view, setView] = useState<View>('portfolio');
  const [nearest, setNearest] = useState<Anchor | null>(null);
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const isWorld = view === 'world';
  const scene: SceneId = 'town';
  const worldMain = useRef<HTMLElement>(null);

  const showPortfolio = () => {
    setActivePanel(null);
    setNearest(null);
    setView('portfolio');
  };
  const handleNearestChange = useCallback((next: Anchor | null) => {
    setNearest((current) => current?.id === next?.id ? current : next);
  }, []);
  const openPanel = useCallback((panel: PanelId) => setActivePanel(panel), []);

  useEffect(() => {
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
        <main id="main-content" className="world-view" ref={worldMain} tabIndex={-1}>
          <div className="world-moon" aria-hidden="true" />
          <WorldCanvas scene={scene} panelOpen={activePanel !== null} onNearestChange={handleNearestChange} onOpenPanel={openPanel} />
          <div className="world-overlay">
            <p className="eyebrow">{portfolio.worldIntro.eyebrow}</p>
            <h1>{portfolio.worldIntro.title}</h1>
            <p>{portfolio.worldIntro.description}</p>
            <button type="button" className="primary-button" onClick={showPortfolio}>View portfolio</button>
          </div>
          {!activePanel && <Hud nearest={nearest} />}
        </main>
      ) : <Portfolio />}
      {isWorld && <ProjectDialog panel={activePanel} onDismiss={() => setActivePanel(null)} />}
      <footer className="site-footer"><span>{portfolio.name}</span><span>Built for a quiet twilight.</span></footer>
    </div>
  );
}
