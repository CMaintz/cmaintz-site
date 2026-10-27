import { getCollection, type CollectionEntry } from 'astro:content';
import snapshot from '../data/github.json';
import type { TagId } from '../data/tags';
import type { McpCatalog } from './mcp-tools';
import { type Lang, localize, withSlash } from '../i18n/ui';

export type Repo = (typeof snapshot.repos)[number];
export type Project = CollectionEntry<'projects'>;
export type Post = CollectionEntry<'blog'>;

export const github = snapshot;

function repo(name: string): Repo | undefined {
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

/** Published posts, newest first; only those written in `lang` when it is given. */
export async function getPosts(lang?: Lang) {
  const posts = await getCollection(
    'blog',
    (p) => (import.meta.env.DEV || !p.data.draft) && (!lang || p.data.lang === lang),
  );
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Projects and posts as the /mcp tools and the site assistant read them. */
export async function loadCatalog(base: URL): Promise<McpCatalog> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  return {
    base,
    projects: projects.map((p) => ({ id: p.id, ...p.data })),
    posts: posts.map((p) => ({ id: p.id, ...p.data })),
  };
}

/** Unlocalized path of a post; pass it through localize() with the post's language. */
export const postBase = (post: Post) => `/blog/${post.id}`;

/** A post lives under its own language: /blog/<id> or /da/blog/<id>. */
export const postPath = (post: Post) => withSlash(localize(postBase(post), post.data.lang));

/** Prose only: code fences and HTML tags don't count as reading. */
const proseOf = (body: string) => body.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ');

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

export const readingTime = (body: string | undefined) => Math.max(1, Math.round(wordCount(proseOf(body ?? '')) / 220));

export function allTags(posts: Post[]) {
  const counts = new Map<TagId, number>();
  for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** "2025-10" -> "Oct 2025" in the given locale. */
function monthLabel(ym: string, lang: 'en' | 'da') {
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

export async function postsInArea(area: string, lang: Lang) {
  return (await getPosts(lang)).filter((p) => (p.data.areas as string[]).includes(area));
}
