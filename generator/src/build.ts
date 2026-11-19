/**
 * Build every asset and the README from profile.config.ts + data/github.json.
 *
 *   npm run build          (from /generator)
 *
 * Each SVG is written once per theme into ../assets/<group>/<name>-{dark,light}.svg, then passed through a
 * deliberately small SVGO pass (numbers and path data only: ids, classes, groups and styles are left alone,
 * because the CSS animations depend on them).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimize } from 'svgo';
import config from '../profile.config.ts';
import type { GithubData } from './data.ts';
import { computeStats } from './stats.ts';
import { themes, type Theme } from './tokens.ts';
import { hero } from './scenes/hero.ts';
import { section, type SectionSpec } from './scenes/section.ts';
import { stackPanel } from './scenes/stack.ts';
import { projectCard } from './scenes/project.ts';
import { telemetry } from './scenes/telemetry.ts';
import { closing } from './scenes/closing.ts';
import { badge, type BadgeSpec } from './scenes/badge.ts';
import { readme, type Built } from './readme.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const repo = resolve(root, '..');
const assets = resolve(repo, 'assets');

const dataFile = resolve(root, 'data/github.json');
if (!existsSync(dataFile)) throw new Error('data/github.json is missing: run `npm run fetch` first');
const data = JSON.parse(readFileSync(dataFile, 'utf8')) as GithubData;
const stats = computeStats(data, config);

// config sanity: every stack item must point at repos that exist
const names = new Set(data.repos.map((r) => r.name));
for (const item of config.stack) for (const r of item.repos) if (!names.has(r)) console.warn(`! stack item "${item.name}" cites ${r}, which is not a public repo of ${data.login}`);

// the generator owns these folders: clear them so nothing stale survives a rebuild
const GROUPS = ['hero', 'sections', 'accretion', 'orbits', 'telemetry', 'closing', 'links'];
for (const gname of GROUPS) rmSync(resolve(assets, gname), { recursive: true, force: true });

const written: { file: string; bytes: number }[] = [];
function write(rel: string, svg: string) {
  const file = resolve(assets, rel);
  mkdirSync(dirname(file), { recursive: true });
  const out = optimize(svg, {
    multipass: false,
    plugins: ['removeComments', { name: 'cleanupNumericValues', params: { floatPrecision: 2 } }, { name: 'convertPathData', params: { floatPrecision: 2, transformPrecision: 4 } }],
  }).data;
  writeFileSync(file, out);
  written.push({ file: relative(repo, file).replace(/\\/g, '/'), bytes: Buffer.byteLength(out) });
}
const both = (group: string, name: string, render: (t: Theme) => string) => {
  for (const t of [themes.dark, themes.light]) write(`${group}/${name}-${t.name}.svg`, render(t));
  return `${group}/${name}`;
};

const built: Built = { hero: '', sections: {}, stack: '', projects: [], telemetry: '', closing: '', links: [] };

built.hero = both('hero', 'event-horizon', (t) => hero(t, stats, { song: config.song, quote: config.quote }));

const SECTIONS: Record<string, SectionSpec> = {
  singularity: { index: '01', title: 'Singularity', note: "who's at the center", doodle: 'voidling' },
  accretion: { index: '02', title: 'Accretion', note: 'what my public projects are built from', doodle: 'spiral' },
  orbits: { index: '03', title: 'Orbits', note: 'public repos, in orbit', doodle: 'orbit' },
  telemetry: { index: '04', title: 'Telemetry', note: 'signals from the last 12 months', doodle: 'eye' },
};
for (const [key, spec] of Object.entries(SECTIONS)) built.sections[key] = { path: both('sections', `${spec.index}-${key}`, (t) => section(t, spec)), spec };

built.stack = both('accretion', 'stack', (t) => stackPanel(t, stats, config.stack));

stats.featured.forEach((r, i) => {
  const blurb = config.projects.blurbs[r.name] ?? r.description ?? null;
  built.projects.push({ path: both('orbits', r.name.toLowerCase(), (t) => projectCard(t, r, i, blurb)), repo: r, blurb });
});

built.telemetry = both('telemetry', 'telemetry', (t) => telemetry(t, stats));
built.closing = both('closing', 'end', (t) => closing(t, stats));

// links: the GitHub handle always; the rest only once they are filled in profile.config.ts
const links: { key: string; href: string; spec: BadgeSpec }[] = [
  { key: 'github', href: `https://github.com/${data.login}`, spec: { label: `@${data.login}`, aria: `@${data.login} on GitHub`, kind: 'primary', glyph: { brand: 'github' } } },
];
if (config.links.website) links.push({ key: 'website', href: config.links.website, spec: { label: config.links.website.replace(/^https?:\/\//, '').replace(/\/$/, ''), aria: `Website: ${config.links.website}`, kind: 'secondary', glyph: { icon: 'globe' } } });
if (config.links.email) links.push({ key: 'email', href: `mailto:${config.links.email}`, spec: { label: config.links.email, aria: `Email: ${config.links.email}`, kind: 'secondary', glyph: { icon: 'mail' } } });
if (config.links.sponsors) links.push({ key: 'sponsors', href: `https://github.com/sponsors/${data.login}`, spec: { label: 'Sponsor', aria: 'GitHub Sponsors', kind: 'secondary', glyph: { icon: 'heart' } } });
for (const l of links) {
  let width = 0;
  const path = both('links', l.key, (t) => {
    const b = badge(t, l.spec);
    width = b.width;
    return b.svg;
  });
  built.links.push({ path, href: l.href, alt: l.spec.aria, width });
}

writeFileSync(resolve(repo, 'README.md'), readme(built, stats, config));
written.push({ file: 'README.md', bytes: Buffer.byteLength(readFileSync(resolve(repo, 'README.md'))) });

const todo = [!config.links.website && 'links.website', !config.links.email && 'links.email', !config.links.sponsors && 'links.sponsors', !config.now && 'now'].filter(Boolean);
for (const w of written) console.log(`${(w.bytes / 1024).toFixed(1).padStart(6)} KB  ${w.file}`);
console.log(`\n${written.length} files · ${(written.reduce((a, w) => a + w.bytes, 0) / 1024).toFixed(0)} KB total · data from ${data.fetchedAt.slice(0, 10)} (${data.source})`);
if (todo.length) console.log(`left out until filled in profile.config.ts: ${todo.join(', ')}`);
