/** Everything the artwork says about activity is derived here from data/github.json, and only from it. */
import type { GithubData, Repo, Day } from './data.ts';
import type { ProfileConfig } from '../profile.config.ts';

export interface LangShare {
  name: string;
  share: number; // 0..1
}

export interface Stats {
  login: string;
  name: string;
  tagline: string;
  since: number;
  years: number;
  /** the last 365 days of the calendar, oldest first */
  days: Day[];
  windowStart: string;
  windowEnd: string;
  total: number;
  activeDays: number;
  longestStreak: number;
  biggestDay: Day | null;
  busiestMonth: { month: string; count: number } | null;
  weekdays: number[]; // Sun..Sat
  busiestWeekday: number | null;
  publicRepos: number;
  originals: Repo[];
  featured: Repo[];
  languages: LangShare[];
  updated: string; // YYYY-MM-DD of the data
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
export function fmtMonth(iso: string): string {
  const [y, m] = iso.slice(0, 7).split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function computeStats(data: GithubData, config: ProfileConfig): Stats {
  const days = data.calendar.slice(-365);
  const total = days.reduce((s, d) => s + d.count, 0);
  let streak = 0;
  let best = 0;
  for (const d of days) {
    streak = d.count > 0 ? streak + 1 : 0;
    best = Math.max(best, streak);
  }
  const biggest = days.reduce<Day | null>((a, d) => (d.count > 0 && (!a || d.count > a.count) ? d : a), null);
  const months = new Map<string, number>();
  for (const d of days) months.set(d.date.slice(0, 7), (months.get(d.date.slice(0, 7)) ?? 0) + d.count);
  let busiestMonth: Stats['busiestMonth'] = null;
  for (const [month, count] of months) if (count > 0 && (!busiestMonth || count > busiestMonth.count)) busiestMonth = { month, count };
  const weekdays = [0, 0, 0, 0, 0, 0, 0];
  for (const d of days) weekdays[new Date(d.date + 'T00:00:00Z').getUTCDay()] += d.count;
  const maxW = Math.max(...weekdays);
  const created = new Date(data.createdAt);
  const asOf = new Date(data.fetchedAt);
  const years = Math.floor((asOf.getTime() - created.getTime()) / (365.25 * 864e5));

  const originals = data.repos.filter((r) => !r.fork && r.name.toLowerCase() !== data.login.toLowerCase());
  const pool = data.repos.filter(
    (r) => r.name.toLowerCase() !== data.login.toLowerCase() && (config.projects.includeForks || !r.fork) && !config.projects.exclude.includes(r.name),
  );
  const order = config.projects.order;
  pool.sort((a, b) => {
    const ia = order.indexOf(a.name);
    const ib = order.indexOf(b.name);
    if (ia >= 0 || ib >= 0) return (ia < 0 ? 1e9 : ia) - (ib < 0 ? 1e9 : ib);
    return a.pushedAt < b.pushedAt ? 1 : -1;
  });

  // language share: each original repo weighs the same (one huge bundled file shouldn't decide it)
  const acc = new Map<string, number>();
  const weighted = originals.filter((r) => Object.keys(r.languages).length);
  for (const r of weighted) {
    const sum = Object.values(r.languages).reduce((s, v) => s + v, 0);
    for (const [lang, bytes] of Object.entries(r.languages)) acc.set(lang, (acc.get(lang) ?? 0) + bytes / sum / weighted.length);
  }
  const languages = [...acc.entries()].map(([name, share]) => ({ name, share })).sort((a, b) => b.share - a.share);

  return {
    login: data.login,
    name: config.name,
    tagline: config.tagline ?? data.bio ?? '',
    since: created.getUTCFullYear(),
    years,
    days,
    windowStart: days[0]?.date ?? '',
    windowEnd: days[days.length - 1]?.date ?? '',
    total,
    activeDays: days.filter((d) => d.count > 0).length,
    longestStreak: best,
    biggestDay: biggest,
    busiestMonth,
    weekdays,
    busiestWeekday: maxW > 0 ? weekdays.indexOf(maxW) : null,
    publicRepos: data.publicRepos,
    originals,
    featured: pool.slice(0, config.projects.max),
    languages,
    updated: data.fetchedAt.slice(0, 10),
  };
}
