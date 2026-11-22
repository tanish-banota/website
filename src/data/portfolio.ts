export type ProjectId = 'event-finder' | 'tranquility-base' | 'scarlet-exchange';

export type Link = {
  label: string;
  href: string;
};

export type Project = {
  id: ProjectId;
  title: string;
  summary: string;
  links: Link[];
};

export type Experience = {
  id: string;
  area: string;
  organization: string;
  dates: string;
  details: string[];
};

export type PortfolioData = {
  name: string;
  affiliation: string;
  intro: string;
  email: string;
  worldIntro: { eyebrow: string; title: string; description: string };
  projects: Project[];
  experience: Experience[];
  resumeHref: string | null;
};

// Project summaries describe the linked repositories, without personal contribution claims.
export const portfolio: PortfolioData = {
  name: 'Tanish Banota',
  affiliation: 'Rutgers University',
  intro: 'My projects and experience are collected below. A fuller introduction is coming soon.',
  email: 'banotatanish@gmail.com',
  worldIntro: {
    eyebrow: 'Town walk / Phase 3',
    title: 'A quiet town at twilight.',
    description: 'Walk with WASD or arrow keys. Explore the clock square and observatory path; landmark interactions arrive later.',
  },
  projects: [
    {
      id: 'event-finder',
      title: 'Event Finder',
      summary: 'A Rutgers campus event discovery app with a searchable, tag-filtered event feed and event pages.',
      links: [{ label: 'GitHub', href: 'https://github.com/tanish-banota/RTSWEPROJECT' }],
    },
    {
      id: 'tranquility-base',
      title: 'Tranquility Base',
      summary: 'A lunar south-pole landing-site explorer that visualizes terrain, sunlight, and Earth visibility in 3D and compares alternative sites and dates against mission constraints.',
      links: [{ label: 'GitHub', href: 'https://github.com/rohansh2017/Space-Apps-2026' }],
    },
    {
      id: 'scarlet-exchange',
      title: 'Scarlet Exchange',
      summary: 'A Rutgers-themed play-money prediction market for campus questions, with YES/NO shares, changing prices, and market settlement.',
      links: [{ label: 'GitHub', href: 'https://github.com/Nirmit651/HackRU2026' }],
    },
  ],
  experience: [
    {
      id: 'research',
      area: 'Research Assistant',
      organization: 'Rutgers University',
      dates: 'Mar 2026 – Aug 2026',
      details: [
        'Investigated how introductory computer science students perceived predictive-model-based interventions for identifying and supporting at-risk students.',
        'Analyzed CS1 student interviews about help-seeking, emotional responses, and instructor outreach; coded transcripts in NVivo 14 using hybrid deductive–inductive thematic analysis.',
        'Refined coding schemes, identified recurring themes, reconciled coding differences, and achieved inter-rater agreement of κ ≥ 0.85.',
      ],
    },
    {
      id: 'teaching',
      area: 'Teaching Assistant Trainee',
      organization: 'Rutgers University · CS111 & CS112',
      dates: 'Aug 2026 – Present',
      details: [
        'Trained to support CS111 and CS112 instruction, assisting students with debugging, programming concepts, and assignments.',
        'Created and refactored coding assignments to reinforce programming concepts and problem-solving strategies.',
        'Developed explanations of programming concepts and adapted instruction for students with different levels of experience and learning needs.',
      ],
    },
    {
      id: 'usacs',
      area: 'Education Chair',
      organization: 'Undergraduate Student Alliance of Computer Scientists (USACS)',
      dates: 'Jul 2026 – Present',
      details: [
        'Increased attendance at USACS education events by 40% through event planning, outreach, and content shaped around student interests.',
        'Planned educational and career-development events focused on technical skills, internship preparation, and professional development.',
        'Organized student events and built relationships with USACS alumni and industry professionals to offer mentorship and career guidance.',
      ],
    },
  ],
  resumeHref: '/resume.pdf',
};
