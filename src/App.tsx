import { useEffect, useRef, useState } from 'react';
import { portfolio } from './data/portfolio';
import { Portfolio } from './ui/Portfolio';
import { WorldCanvas } from './world/WorldCanvas';

type View = 'portfolio' | 'world';

export default function App() {
  const [view, setView] = useState<View>('portfolio');
  const isWorld = view === 'world';
  const worldMain = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isWorld) worldMain.current?.focus({ preventScroll: true });
  }, [isWorld]);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <a className="brand" href="#about" onClick={() => setView('portfolio')} aria-label={`${portfolio.name}, portfolio home`}>
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>{portfolio.name}</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#about" onClick={() => setView('portfolio')}>About</a>
          <a href="#projects" onClick={() => setView('portfolio')}>Projects</a>
          <a href="#experience" onClick={() => setView('portfolio')}>Experience</a>
          <a href="#contact" onClick={() => setView('portfolio')}>Contact</a>
        </nav>
        <div className="view-switch" aria-label="Choose view">
          <button type="button" aria-pressed={!isWorld} onClick={() => setView('portfolio')}>View portfolio</button>
          <button type="button" aria-pressed={isWorld} onClick={() => setView('world')}>Explore town</button>
        </div>
      </header>
      {isWorld ? (
        <main id="main-content" className="world-view" ref={worldMain} tabIndex={-1}>
          <div className="world-moon" aria-hidden="true" />
          <WorldCanvas />
          <div className="world-overlay">
            <p className="eyebrow">{portfolio.worldIntro.eyebrow}</p>
            <h1>{portfolio.worldIntro.title}</h1>
            <p>{portfolio.worldIntro.description}</p>
            <button type="button" className="primary-button" onClick={() => setView('portfolio')}>View portfolio</button>
          </div>
        </main>
      ) : <Portfolio />}
      <footer className="site-footer"><span>{portfolio.name}</span><span>Built for a quiet twilight.</span></footer>
    </div>
  );
}
