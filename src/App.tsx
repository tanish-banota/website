import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react';
import { portfolio } from './data/portfolio';
import { Portfolio } from './ui/Portfolio';
import { WorldErrorBoundary } from './WorldErrorBoundary';

const WorldExperience = lazy(() => import('./world/WorldExperience'));
type View = 'portfolio' | 'world';

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function WorldMessage({ failed, onExit, onRetry }: { failed: boolean; onExit: () => void; onRetry?: () => void }) {
  return <main id="main-content" className="world-message" tabIndex={-1}>
    <div className="world-message-card" role={failed ? 'alert' : 'status'}>
      <p className="eyebrow">Explore town</p>
      <h1>{failed ? 'The town could not open.' : 'Opening the town…'}</h1>
      <p>{failed ? 'The regular portfolio is ready to use. You can try the town again or continue below.' : 'Preparing the 3D scene. The portfolio is still available.'}</p>
      <div className="world-message-actions">
        {failed && onRetry && <button type="button" className="primary-button" onClick={onRetry}>Try again</button>}
        <button type="button" className="primary-button" onClick={onExit}>View portfolio</button>
      </div>
    </div>
  </main>;
}

function ViewSwitch({ isWorld, onPortfolio, onExplore }: { isWorld: boolean; onPortfolio: () => void; onExplore: () => void }) {
  return <div className="view-switch">
    <button type="button" aria-pressed={!isWorld} onClick={onPortfolio}>View portfolio</button>
    <button type="button" aria-pressed={isWorld} onClick={onExplore}>Explore town</button>
  </div>;
}

export default function App() {
  const [view, setView] = useState<View>(() => new URLSearchParams(window.location.search).get('view') === 'portfolio' ? 'portfolio' : 'world');
  const [worldFailed, setWorldFailed] = useState(() => !webglAvailable());
  const [attempt, setAttempt] = useState(0);
  const focusPortfolio = useRef(false);
  const isWorld = view === 'world';

  const showPortfolio = () => {
    focusPortfolio.current = true;
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'portfolio');
    window.history.replaceState(null, '', url);
    setView('portfolio');
    setWorldFailed(false);
  };
  const explore = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    window.history.replaceState(null, '', url);
    setAttempt((current) => current + 1);
    setWorldFailed(!webglAvailable());
    setView('world');
  };

  useLayoutEffect(() => {
    if (view !== 'portfolio' || !focusPortfolio.current) return;
    focusPortfolio.current = false;
    document.getElementById('main-content')?.focus({ preventScroll: true });
    const target = decodeURIComponent(window.location.hash.slice(1));
    if (target) document.getElementById(target)?.scrollIntoView();
  }, [view]);

  const failure = <WorldMessage failed onExit={showPortfolio} onRetry={explore} />;

  return <div className={`site-shell ${isWorld ? 'world-mode' : ''}`}>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    {!isWorld ? <header className="site-header">
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
      <div className="view-control">
        <ViewSwitch isWorld={isWorld} onPortfolio={showPortfolio} onExplore={explore} />
        <span className="explore-note">Town exploration needs a keyboard.</span>
      </div>
    </header> : <div className="world-view-switch">
      <ViewSwitch isWorld={isWorld} onPortfolio={showPortfolio} onExplore={explore} />
    </div>}
    {isWorld ? worldFailed ? failure : (
      <WorldErrorBoundary key={attempt} fallback={failure}>
        <Suspense fallback={<WorldMessage failed={false} onExit={showPortfolio} />}>
          <WorldExperience onExit={showPortfolio} onFatalError={() => setWorldFailed(true)} />
        </Suspense>
      </WorldErrorBoundary>
    ) : <Portfolio />}
    <footer className="site-footer"><span>{portfolio.name}</span><span>Built for a quiet twilight.</span></footer>
  </div>;
}
