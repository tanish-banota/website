import { useEffect, useRef } from 'react';
import { portfolio } from '../data/portfolio';
import type { PanelId } from '../world/interactions';

function PanelContent({ panel }: { panel: PanelId }) {
  const project = portfolio.projects.find((item) => item.id === panel);
  if (project) {
    return (
      <>
        <p>{project.summary}</p>
        {project.links.length > 0 && (
          <ul className="link-list">
            {project.links.map((link) => (
              <li key={link.href}><a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a></li>
            ))}
          </ul>
        )}
      </>
    );
  }
  if (panel === 'about') {
    return (
      <>
        <p>{portfolio.affiliation}</p>
        <p>{portfolio.intro}</p>
        {import.meta.env.DEV && <span className="review-badge">Content placeholder</span>}
      </>
    );
  }
  if (panel === 'experience') {
    return (
      <div className="dialog-experience">
        {portfolio.experience.map((item) => (
          <section key={item.id} aria-label={item.area}>
            <h3>{item.area}</h3>
            <p className="experience-meta">{item.organization} · {item.dates}</p>
            <ul>{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
          </section>
        ))}
      </div>
    );
  }
  return (
    <div className="dialog-contact">
      <a href={`mailto:${portfolio.email}`}>{portfolio.email}</a>
      {portfolio.resumeHref && <a href={portfolio.resumeHref} download>Download resume (PDF)</a>}
    </div>
  );
}

export function ProjectDialog({ panel, onDismiss }: { panel: PanelId | null; onDismiss: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!panel || !dialog.current) return;
    if (!dialog.current.open) {
      previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.current.showModal();
    }
    title.current?.focus({ preventScroll: true });
  }, [panel]);

  if (!panel) return null;
  const project = portfolio.projects.find((item) => item.id === panel);
  const heading = project?.title ?? (panel === 'about' ? 'About' : panel === 'experience' ? 'Experience' : 'Contact');

  const close = () => {
    onDismiss();
    previousFocus.current?.focus({ preventScroll: true });
  };

  return (
    <dialog ref={dialog} className="project-dialog" aria-labelledby="dialog-title" onClose={close}>
      <div className="dialog-heading">
        <h2 id="dialog-title" ref={title} tabIndex={-1}>{heading}</h2>
        <button type="button" className="dialog-close" onClick={() => dialog.current?.close()} aria-label="Close panel">Close</button>
      </div>
      <div className="dialog-body"><PanelContent panel={panel} /></div>
    </dialog>
  );
}
