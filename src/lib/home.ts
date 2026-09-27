// Content shared by the main homepage and the /editorial, /technical and
// /bold style previews, so the previews compare style, not content.
import { useT } from '../i18n/ui';
import { getFeaturedProjects, getPosts, projectRepoStats, readingTime, github } from './content';

const FOCUS_KEYS = ['dx', 'devops', 'platform', 'ai'] as const;

export function focusAreas() {
  const t = useT('en');
  return FOCUS_KEYS.map((k) => ({ title: t(`focus.${k}.title`), body: t(`focus.${k}.body`) }));
}

async function featuredCards() {
  const projects = await getFeaturedProjects(6);
  return projects.map((p) => ({
    id: p.id,
    title: p.data.title,
    tagline: p.data.tagline.en,
    summary: p.data.summary.en,
    category: p.data.category,
    stack: p.data.stack.slice(0, 4),
    stars: projectRepoStats(p)?.stars ?? 0,
    pushedAt: projectRepoStats(p)?.pushedAt,
  }));
}

async function latestPosts() {
  const posts = (await getPosts()).slice(0, 3);
  return posts.map((p) => ({
    id: p.id,
    title: p.data.title,
    description: p.data.description,
    date: p.data.pubDate,
    minutes: readingTime(p.body),
  }));
}

export function recentRepos(n = 5) {
  return [...github.repos].sort((a, b) => b.pushedAt.localeCompare(a.pushedAt)).slice(0, n);
}

export async function homeData() {
  const t = useT('en');
  return {
    hello: t('home.hello'),
    lede: t('home.lede'),
    status: t('home.status'),
    ctaTitle: t('home.cta.title'),
    ctaBody: t('home.cta.body'),
    focus: focusAreas(),
    projects: await featuredCards(),
    posts: await latestPosts(),
  };
}
