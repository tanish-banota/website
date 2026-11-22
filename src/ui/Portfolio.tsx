import { portfolio } from '../data/portfolio';

function ReviewBadge() {
  return import.meta.env.DEV ? <span className="review-badge">Content placeholder</span> : null;
}

export function Portfolio() {
  return (
    <main id="main-content" className="portfolio">
      <section id="about" className="hero section" aria-labelledby="about-title">
        <div className="hero-copy">
          <p className="eyebrow">About</p>
          <h1 id="about-title">{portfolio.name}</h1>
          <p className="affiliation">{portfolio.affiliation}</p>
          <p className="intro">{portfolio.intro}</p>
          <ReviewBadge />
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-moon" />
          <div className="hero-hill" />
          <div className="hero-house"><div className="hero-roof" /><div className="hero-window" /></div>
        </div>
      </section>

      <section id="projects" className="section" aria-labelledby="projects-title">
        <div className="section-heading">
          <p className="eyebrow">Selected work</p>
          <h2 id="projects-title">Projects</h2>
        </div>
        <div className="card-grid">
          {portfolio.projects.map((project, index) => (
            <article className="content-card" key={project.id}>
              <p className="card-index">0{index + 1} / Project</p>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              {project.links.length > 0 && (
                <ul className="link-list">
                  {project.links.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className="section" aria-labelledby="experience-title">
        <div className="section-heading">
          <p className="eyebrow">Experience</p>
          <h2 id="experience-title">What I’ve worked on</h2>
        </div>
        <div className="experience-list">
          {portfolio.experience.map((item) => (
            <article className="experience-row" key={item.id}>
              <h3>{item.area}</h3>
              <div>
                <p className="experience-meta">{item.organization} · {item.dates}</p>
                <ul className="experience-details">
                  {item.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="section contact" aria-labelledby="contact-title">
        <p className="eyebrow">Get in touch</p>
        <h2 id="contact-title">Contact</h2>
        <div className="contact-links">
          <a className="email-link" href={`mailto:${portfolio.email}`}>{portfolio.email}</a>
          {portfolio.resumeHref && <a className="resume-link" href={portfolio.resumeHref} download>Download resume (PDF)</a>}
        </div>
      </section>
    </main>
  );
}
