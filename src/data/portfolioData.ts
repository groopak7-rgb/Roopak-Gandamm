import type {
  AchievementItem,
  JourneyItem,
  NavSectionId,
  ProfileDetails,
  ProjectItem,
  SkillGroup,
  ValuePillar,
} from '../types/portfolio';
import achievementCrestImg from '../assets/images/achievement_crest_1794755453499.jpg';
import eazyTalkShowcaseImg from '../assets/images/eazytalk_showcase_1794755451396.jpg';
import hiisaabShowcaseImg from '../assets/images/hiisaab_showcase_1794755452458.jpg';
import vidyaMargShowcaseImg from '../assets/images/vidyamarg_showcase_1794755452080.jpg';

export const DEFAULT_ACHIEVEMENT_CREST_URL = achievementCrestImg;

export const NAV_ITEMS: { id: NavSectionId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Contact' },
];

export const PROFILE_DETAILS: ProfileDetails = {
  name: 'Roopak Gandamm',
  role: 'Aspiring Professional Full-Stack Developer',
  headline:
    'Designing and engineering end-to-end web software while pursuing my dream of becoming a professional Full-Stack Developer.',
  heroIntro:
    'I build modern web applications from front to back—combining clean, responsive interfaces with reliable server architecture. Creator of VidyaMarg and Eazy Talk, and currently building Hiisaab.',
  currentlyBuildingLabel: 'Currently building',
  aboutBio: [
    'My name is Roopak Gandamm, and my core ambition is to become a professional Full-Stack Developer who can take an idea from a blank canvas all the way to a fast, resilient, production-grade product. I enjoy working across the entire stack because great software happens when thoughtful user interface design meets solid backend engineering.',
    'What excites me most about full-stack development is end-to-end ownership: crafting accessible, smooth frontend experiences in React and TypeScript while designing clean APIs, structured databases, and real-time communication flows behind the scenes.',
    'Every project I build is grounded in practical problem solving—writing maintainable TypeScript, practicing algorithmic thinking in Python, debugging thoughtfully, and shipping live web apps that real users can test directly in their browser.',
    'With VidyaMarg and Eazy Talk live on the web, I am now preparing Hiisaab for launch while continually sharpening full-stack architecture, performance, and UI craft.',
  ],
  dreamPoints: [
    {
      title: 'End-to-End Product Ownership',
      detail:
        'Bridging frontend usability and backend reliability so features feel cohesive from database query to pixel.',
    },
    {
      title: 'Production-Ready Engineering',
      detail:
        'Focusing on clean TypeScript architecture, predictable API contracts, data integrity, and responsive performance.',
    },
    {
      title: 'Practical Problem Solving',
      detail:
        'Shipping live tools like VidyaMarg and Eazy Talk alongside upcoming full-stack apps like Hiisaab for everyday workflows.',
    },
    {
      title: 'Continuous Growth & Craft',
      detail:
        'Consistently practicing Python algorithms, modern web frameworks, system design, and Git workflows.',
    },
  ],
  location: 'India · Remote Worldwide',
  email: 'groopak7@gmail.com',
  githubUrl: 'https://github.com/groopak7-rgb',
  linkedinUrl:
    'https://www.linkedin.com/in/roopak-g-556786426?utm_source=share_via&utm_content=profile&utm_medium=member_android',
};

export const ENGINEERING_JOURNEY: JourneyItem[] = [
  {
    period: '2024',
    title: 'Core Programming & Algorithmic Problem Solving',
    detail:
      'Built strong fundamentals in Python problem solving, data structures, semantic HTML/CSS, and JavaScript logic.',
  },
  {
    period: '2025',
    title: 'Modern Full-Stack Architecture & UI Systems',
    detail:
      'Focused on React, TypeScript, Tailwind CSS, Node.js/Express APIs, relational data modeling, and responsive accessibility.',
  },
  {
    period: '2026',
    title: 'Live Production Launches: VidyaMarg & Eazy Talk',
    detail:
      'Shipped VidyaMarg and Eazy Talk live to the web with open GitHub source code, and currently engineering Hiisaab for upcoming release.',
  },
];

export const VALUE_PILLARS: ValuePillar[] = [
  {
    id: 'clean-code',
    index: '01.',
    title: 'Clean Code',
    description:
      'Modular TypeScript architecture, predictable state boundaries, and readable components built to evolve without friction.',
  },
  {
    id: 'fast-delivery',
    index: '02.',
    title: 'Fast Delivery',
    description:
      'Iterative shipping from clear prototypes to production deployments, prioritizing real user feedback over endless speculation.',
  },
  {
    id: 'user-first',
    index: '03.',
    title: 'User-First',
    description:
      'Accessible contrast, responsive layouts across every viewport, and zero-latency interactions that respect people’s attention.',
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    category: 'Frontend & Interface',
    items: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Motion', 'HTML5 / CSS3'],
  },
  {
    category: 'Backend & Data',
    items: ['Node.js', 'Express', 'Python', 'PostgreSQL', 'REST APIs', 'WebSockets'],
  },
  {
    category: 'Workflow & Craft',
    items: ['Git & GitHub', 'Vite', 'Vercel / Cloud Deploy', 'UI Systems', 'Responsive Design'],
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'vidyamarg',
    slotId: 'project-vidyamarg',
    title: 'VidyaMarg',
    subtitle: 'Guided Learning & Career Pathway Platform',
    status: 'Live',
    year: '2026',
    domainLabel: 'pathfinder-ratings-hub.lovable.app',
    role: 'Creator & Full-Stack Builder',
    problem:
      'Students often struggle to connect scattered tutorials into a clear, actionable career progression with transparent community feedback.',
    solution:
      'Designed and deployed a structured roadmap and rating hub where learners explore curated tracks, track study milestones, and navigate resources without clutter.',
    description:
      'A structured learning platform designed to help students discover curated roadmaps, track study milestones, and bridge the gap between foundational concepts and real-world engineering skills.',
    highlights: [
      'Structured topic roadmaps with clear milestone tracking',
      'Distraction-free reading and resource curation workspace',
      'Mobile-ready responsive experience deployed live on the web',
    ],
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
    imageAlt: 'VidyaMarg application showcase',
    defaultImageUrl: vidyaMargShowcaseImg,
    demoUrl: 'https://pathfinder-ratings-hub.lovable.app',
  },
  {
    id: 'project-2',
    slotId: 'project-2',
    title: 'Hiisaab',
    subtitle: 'Smart Expense & Ledger Web App · Coming soon to live action',
    status: 'Coming Soon',
    year: '2026',
    domainLabel: 'hiisaab · upcoming live release',
    role: 'Full-Stack Developer',
    problem:
      'Everyday personal expenses and shared friend/group splits quickly get messy across notes apps and chat threads.',
    solution:
      'Engineering a clean ledger web app focused on fast transaction capture, categorized spending trends, and transparent balance reconciliation.',
    description:
      'A full-stack expense and ledger web application currently being prepared for launch—built to make daily spending logs, shared splits, and balance clarity effortless. Coming soon to live action.',
    highlights: [
      'Clean expense entry and categorized transaction history',
      'Automated balance summaries and shared split tracking',
      'Coming soon to live action — web deployment underway',
    ],
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
    imageAlt: 'Hiisaab web application preview',
    defaultImageUrl: hiisaabShowcaseImg,
  },
  {
    id: 'project-3',
    slotId: 'project-3',
    title: 'Eazy Talk',
    subtitle: 'Fast Real-Time Messaging Web App',
    status: 'Live',
    year: '2026',
    domainLabel: 'eazy-talk-two.vercel.app',
    role: 'Creator & Full-Stack Engineer',
    problem:
      'Spinning up a quick room for real-time discussion often forces users through heavy signups and bloated interfaces.',
    solution:
      'Built and shipped an instant room-based real-time communication web app on Vercel with TypeScript, allowing users to join rooms like ?room=GXYUYQ in one click.',
    description:
      'A responsive real-time communication web application focused on speed, instant room collaboration, and distraction-free conversations across desktop and mobile.',
    highlights: [
      'Instant room link sharing and low-friction messaging flow',
      'Built in TypeScript and deployed live on Vercel',
      'Open-source repository published on GitHub (@groopak7-rgb)',
    ],
    stack: ['React', 'TypeScript', 'Express', 'WebSockets'],
    imageAlt: 'Eazy Talk web application showcase',
    defaultImageUrl: eazyTalkShowcaseImg,
    demoUrl: 'https://eazy-talk-two.vercel.app/?room=GXYUYQ',
    codeUrl: 'https://github.com/groopak7-rgb/eazy-talk',
  },
];

export const ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ach-1',
    slotId: 'achievement-1',
    title: 'VidyaMarg — Live Product Launch',
    issuer: 'Self-Directed Full-Stack Release',
    date: '2026',
    category: 'Shipped Product',
    description:
      'Designed, built, and deployed VidyaMarg end-to-end as a live student learning pathway & rating web application accessible across desktop and mobile.',
    imageAlt: 'VidyaMarg live product launch milestone',
    defaultImageUrl: vidyaMargShowcaseImg,
  },
  {
    id: 'ach-2',
    slotId: 'achievement-2',
    title: 'Eazy Talk — Real-Time Web App & Open Source',
    issuer: 'Vercel Production · GitHub',
    date: '2026',
    category: 'Engineering Milestone',
    description:
      'Architected and published Eazy Talk in TypeScript with instant room-based collaboration, live production hosting, and public source control.',
    imageAlt: 'Eazy Talk deployment and open source milestone',
    defaultImageUrl: eazyTalkShowcaseImg,
  },
  {
    id: 'ach-3',
    slotId: 'achievement-3',
    title: 'Algorithmic & Full-Stack Foundations',
    issuer: 'Python & TypeScript Practice',
    date: '2025',
    category: 'Technical Track',
    description:
      'Built disciplined problem-solving habits in Python alongside modern React, TypeScript, REST APIs, and responsive UI architecture.',
    imageAlt: 'Engineering foundations milestone emblem',
    defaultImageUrl: achievementCrestImg,
  },
];
