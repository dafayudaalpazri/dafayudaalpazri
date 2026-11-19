/**
 * Everything personal on the profile lives in this file. Numbers never do: they come from GitHub
 * (data/github.json, refreshed by `npm run fetch` or the scheduled workflow).
 *
 * After editing: `npm run build` (from /generator) regenerates every SVG and README.md.
 *
 * TODO markers are details the old template only had sample values for. Fill them in or leave them null:
 * anything null is simply left out of the README.
 */

export interface StackItem {
  name: string;
  /** simple-icons slug, or null for a plain dot */
  icon: string | null;
  ring: 'frameworks' | 'tools';
  /** public repos this comes from (checked at build time) */
  repos: string[];
  /** where the fact comes from, shown in the README's details */
  source: string;
}

const config = {
  /** GitHub account the profile belongs to */
  login: 'dafayudaalpazri',

  /** Name in the artwork. GitHub's display name is "Dafaa"; the previous README used "Dapaa". */
  name: 'Dapaa',

  /** Line under the name. null = the GitHub bio (currently "Just me and my hobby"). */
  tagline: 'Full-stack developer & digital product builder' as string | null,

  /**
   * The "Singularity" section, as Markdown paragraphs. Tokens: {name} {login} {since} {bio}.
   * Rewrite freely.
   */
  about: [
    "Hi, I'm **Dafa Yuda Alpazri** (Dapaa), a full-stack developer, digital product builder and technology enthusiast, on GitHub as [@{login}](https://github.com/{login}).",
    'I started exploring code in elementary school and have since worked on 100+ freelance projects, building across backend systems, frontend experiences, 3D web, AI and reverse engineering.',
    "I'm fascinated by how things work beneath the surface: engineering products, exploring systems, and turning unconventional ideas into real-world digital experiences.",
    "I believe curiosity matters more than recognition. Too much attention can make a donkey think it's a lion.",
  ],

  /** The "Now playing" card in the hero. null hides it. */
  song: { title: '505', artist: 'Arctic Monkeys' } as { title: string; artist: string } | null,

  /** The sticky note in the hero. null hides it. */
  quote: "Too much attention can make a donkey think it's a lion." as string | null,

  /** Optional line for what you are working on now. */
  now: 'Building and exploring [HighTablePay](https://hightablepay.site).' as string | null,

  links: {
    /** TODO: your site, e.g. 'https://example.dev' (the template only had example.com) */
    website: null as string | null,
    /** TODO: a public email address (the template only had alex@example.com) */
    email: null as string | null,
    /** TODO: true once github.com/sponsors/<login> is set up (it currently redirects, so it is off) */
    sponsors: false,
  },

  projects: {
    /** cards shown, newest push first; the profile repo itself is always skipped */
    max: 4,
    includeForks: false,
    exclude: [] as string[],
    /** pin an order instead of "newest push first", e.g. ['Porto-2026', 'elpatronwebsite'] */
    order: [] as string[],
    /**
     * One-line descriptions for the cards. GitHub has no description for these repos, so each line is
     * taken from the repo's own README or homepage. A repo without a line here shows its GitHub
     * description, or nothing.
     */
    blurbs: {
      'Porto-2026': 'An interactive 3D portfolio built with React, Three.js and Tailwind CSS.',
      webProduct: 'A Next.js app in TypeScript, started in Firebase Studio.',
      SMKWEB: 'A Next.js website, live on Vercel.',
      elpatronwebsite: 'A JavaScript website, live on Vercel.',
    } as Record<string, string>,
  },

  /**
   * Frameworks and tools for the "Accretion" section. Languages are added automatically from the repos'
   * language data; these come from the READMEs and homepages of the repos listed.
   */
  stack: [
    { name: 'React', icon: 'react', ring: 'frameworks', repos: ['Porto-2026'], source: 'Porto-2026 README' },
    { name: 'Next.js', icon: 'nextdotjs', ring: 'frameworks', repos: ['SMKWEB', 'webProduct'], source: 'SMKWEB and webProduct READMEs' },
    { name: 'Three.js', icon: 'threedotjs', ring: 'tools', repos: ['Porto-2026'], source: 'Porto-2026 README' },
    { name: 'Tailwind CSS', icon: 'tailwindcss', ring: 'tools', repos: ['Porto-2026'], source: 'Porto-2026 README' },
    { name: 'Vite', icon: 'vite', ring: 'tools', repos: ['Porto-2026'], source: 'Porto-2026 README' },
    { name: 'Framer Motion', icon: null, ring: 'tools', repos: ['Porto-2026'], source: 'Porto-2026 README' },
    { name: 'Vercel', icon: 'vercel', ring: 'tools', repos: ['elpatronwebsite', 'SMKWEB', 'Porto-2026'], source: 'homepages of elpatronwebsite, SMKWEB and Porto-2026' },
  ] satisfies StackItem[] as StackItem[],
};

export default config;
export type ProfileConfig = typeof config;
