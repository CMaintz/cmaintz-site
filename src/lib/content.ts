import { getCollection, type CollectionEntry } from 'astro:content';
import snapshot from '../data/github.json';

export type Repo = (typeof snapshot.repos)[number];
export type Project = CollectionEntry<'projects'>;
export type Post = CollectionEntry<'blog'>;

export const github = snapshot;

export function repo(name: string): Repo | undefined {
  return snapshot.repos.find((r) => r.name === name);
}

/** Stars/updated/languages for a project, aggregated across its repos. */
export function projectRepoStats(p: Project) {
  const repos = p.data.repos.map(repo).filter((r): r is Repo => Boolean(r));
  if (!repos.length) return null;
  const primary = repos[0];
  return {
    primary,
    repos,
    stars: repos.reduce((n, r) => n + r.stars, 0),
    pushedAt: repos
      .map((r) => r.pushedAt)
      .sort()
      .at(-1)!,
    languages: primary.languages,
  };
}

export async function getProjects() {
  const all = await getCollection('projects');
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getFeaturedProjects(limit = 6) {
  return (await getProjects()).filter((p) => p.data.featured).slice(0, limit);
}

export async function getPosts() {
  const posts = await getCollection('blog', (p) => import.meta.env.DEV || !p.data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Prose only: code fences and HTML tags don't count as reading. */
const proseOf = (body: string) => body.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ');

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

export const readingTime = (body: string | undefined) => Math.max(1, Math.round(wordCount(proseOf(body ?? '')) / 220));

export function allTags(posts: Post[]) {
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** "2025-10" -> "Oct 2025" in the given locale. */
export function monthLabel(ym: string, lang: 'en' | 'da') {
  const [y, m] = ym.split('-').map(Number);
  if (!m) return String(y);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function monthRange(start: string, end: string | undefined, lang: 'en' | 'da') {
  const present = lang === 'da' ? 'nu' : 'present';
  return `${monthLabel(start, lang)} - ${end ? monthLabel(end, lang) : present}`;
}

export function projectPeriod(p: Project, lang: 'en' | 'da') {
  const { start, end, dateApprox } = p.data;
  if (!dateApprox) return monthRange(start, end, lang);
  const prefix = lang === 'da' ? 'ca. ' : 'approx. ';
  // Approximate single-point dates (exam projects) have no meaningful "present".
  return prefix + (end ? monthRange(start, end, lang) : monthLabel(start, lang));
}

export async function projectsInArea(area: string) {
  return (await getProjects()).filter((p) => (p.data.areas as string[]).includes(area));
}

export async function postsInArea(area: string) {
  return (await getPosts()).filter((p) => (p.data.areas as string[]).includes(area));
}
