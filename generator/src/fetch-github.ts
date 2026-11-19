/**
 * Fetch the public GitHub data the artwork is drawn from and save it to data/github.json.
 *
 *   With GITHUB_TOKEN (the scheduled workflow): one GraphQL query.
 *   Without a token (local runs): the public REST API plus the profile's contribution calendar page.
 *
 * Only public data is read. Nothing in the artwork is typed in by hand: every number comes from here.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../profile.config.ts';
import type { GithubData, Repo, Day } from './data.ts';
import { computeStats } from './stats.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'data/github.json');
const UA = { 'User-Agent': 'event-horizon-profile-generator', Accept: 'application/vnd.github+json' };

async function getJson<T>(url: string, token?: string): Promise<T> {
  const res = await fetch(url, { headers: { ...UA, ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return (await res.json()) as T;
}

async function viaGraphql(login: string, token: string): Promise<GithubData> {
  const query = `query($login:String!){user(login:$login){login name bio createdAt followers{totalCount}
    repositories(ownerAffiliations:OWNER,privacy:PUBLIC,first:100,orderBy:{field:PUSHED_AT,direction:DESC}){totalCount nodes{
      name description url homepageUrl isFork isArchived stargazerCount forkCount pushedAt createdAt primaryLanguage{name}
      languages(first:20,orderBy:{field:SIZE,direction:DESC}){edges{size node{name}}}}}
    contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...UA, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login } }),
  });
  const json = (await res.json()) as { data?: { user: any }; errors?: unknown };
  if (!res.ok || !json.data?.user) throw new Error(`GraphQL failed: ${res.status} ${JSON.stringify(json.errors ?? json)}`);
  const u = json.data.user;
  const repos: Repo[] = u.repositories.nodes.map((r: any) => ({
    name: r.name,
    description: r.description,
    url: r.url,
    homepage: r.homepageUrl || null,
    language: r.primaryLanguage?.name ?? null,
    stars: r.stargazerCount,
    forks: r.forkCount,
    fork: r.isFork,
    archived: r.isArchived,
    pushedAt: r.pushedAt,
    createdAt: r.createdAt,
    languages: Object.fromEntries(r.languages.edges.map((e: any) => [e.node.name, e.size])),
  }));
  const cal = u.contributionsCollection.contributionCalendar;
  const calendar: Day[] = cal.weeks.flatMap((w: any) => w.contributionDays.map((d: any) => ({ date: d.date, count: d.contributionCount })));
  return {
    login: u.login,
    name: u.name,
    bio: u.bio,
    createdAt: u.createdAt,
    followers: u.followers.totalCount,
    publicRepos: u.repositories.totalCount,
    repos,
    calendar,
    totalContributions: cal.totalContributions,
    fetchedAt: new Date().toISOString(),
    source: 'graphql',
  };
}

async function viaPublic(login: string): Promise<GithubData> {
  const u = await getJson<any>(`https://api.github.com/users/${login}`);
  const list = await getJson<any[]>(`https://api.github.com/users/${login}/repos?per_page=100&type=owner&sort=pushed`);
  const repos: Repo[] = [];
  for (const r of list) {
    const languages = await getJson<Record<string, number>>(r.languages_url);
    repos.push({
      name: r.name,
      description: r.description,
      url: r.html_url,
      homepage: r.homepage || null,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      fork: r.fork,
      archived: r.archived,
      pushedAt: r.pushed_at,
      createdAt: r.created_at,
      languages,
    });
  }
  // the calendar fragment GitHub renders on the profile (public, no token needed)
  const html = await (await fetch(`https://github.com/users/${login}/contributions`, { headers: { 'User-Agent': UA['User-Agent'] } })).text();
  const tips = new Map<string, string>();
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) tips.set(m[1], m[2]);
  const calendar: Day[] = [];
  for (const m of html.matchAll(/<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*>/g)) {
    const tip = tips.get(m[2]) ?? '';
    calendar.push({ date: m[1], count: /^No contributions/.test(tip) ? 0 : parseInt(tip.replace(/,/g, ''), 10) || 0 });
  }
  calendar.sort((a, b) => (a.date < b.date ? -1 : 1));
  if (calendar.length < 300) throw new Error(`Could not read the contribution calendar (${calendar.length} days)`);
  const head = html.match(/([\d,]+)\s+contributions?\s+in the last year/);
  const total = head ? parseInt(head[1].replace(/,/g, ''), 10) : calendar.reduce((s, d) => s + d.count, 0);
  return {
    login: u.login,
    name: u.name,
    bio: u.bio,
    createdAt: u.created_at,
    followers: u.followers,
    publicRepos: u.public_repos,
    repos,
    calendar,
    totalContributions: total,
    fetchedAt: new Date().toISOString(),
    source: 'public',
  };
}

export async function fetchGithub(): Promise<GithubData> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  return token ? viaGraphql(config.login, token) : viaPublic(config.login);
}

/**
 * What the artwork actually shows. If none of it changed, the saved snapshot is kept as it is, so the
 * scheduled workflow only commits when there is something new to draw (not every day the window slides).
 */
function signature(d: GithubData): string {
  const s = computeStats(d, config);
  return JSON.stringify({
    name: d.name,
    bio: d.bio,
    since: s.since,
    total: s.total,
    active: s.activeDays,
    streak: s.longestStreak,
    biggest: s.biggestDay,
    month: s.busiestMonth,
    weekdays: s.weekdays,
    repos: s.publicRepos,
    featured: s.featured.map((r) => [r.name, r.description, r.homepage, r.language, r.stars, r.pushedAt.slice(0, 7), Object.keys(r.languages).length]),
    languages: s.languages.map((l) => [l.name, Math.round(l.share * 1000)]),
  });
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('src/fetch-github.ts')) {
  const data = await fetchGithub();
  const active = data.calendar.filter((d) => d.count > 0).length;
  const summary = `${data.login}: ${data.repos.length} repos, ${data.totalContributions} contributions in the last year, ${active} active days (${data.source})`;
  const force = process.argv.includes('--force');
  if (!force && existsSync(OUT) && signature(JSON.parse(readFileSync(OUT, 'utf8')) as GithubData) === signature(data)) {
    console.log(`nothing new to draw, kept ${OUT}\n  ${summary}`);
  } else {
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
    console.log(`saved ${OUT}\n  ${summary}`);
  }
}
