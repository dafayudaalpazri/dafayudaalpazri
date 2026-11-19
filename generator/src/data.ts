/** The data model shared by the fetcher, the stats and the scenes. */

export interface Repo {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  fork: boolean;
  archived: boolean;
  pushedAt: string;
  createdAt: string;
  /** bytes per language, as GitHub's linguist reports them */
  languages: Record<string, number>;
}

export interface Day {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface GithubData {
  login: string;
  name: string | null;
  bio: string | null;
  createdAt: string;
  followers: number;
  publicRepos: number;
  repos: Repo[];
  /** the contribution calendar GitHub shows on the profile (about 53 weeks) */
  calendar: Day[];
  /** GitHub's own "N contributions in the last year" */
  totalContributions: number;
  fetchedAt: string;
  source: 'graphql' | 'public';
}
