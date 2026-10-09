// Build step (Node, from astro.config.mjs): when each page's content last changed,
// for the sitemap's <lastmod> and JSON-LD dateModified. Posts use their front
// matter (updatedDate ?? pubDate); other pages use the last commit touching their
// sources. A shallow clone has no history, so it yields no dates rather than
// stamping every page with the latest commit.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AREA_IDS } from '../data/areas';

/** Unlocalized page path -> the files its content comes from. */
const PAGE_SOURCES: Record<string, string[]> = {
  '/': ['src/views/HomeView.astro', 'src/data/site.ts'],
  '/about/': ['src/views/AboutView.astro', 'src/data/resume.ts', 'src/data/values.ts'],
  '/services/': ['src/views/ServicesView.astro', 'src/data/services.ts', 'src/data/faq.ts'],
  '/cv/': ['src/views/CvView.astro', 'src/data/resume.ts'],
  '/now/': ['src/views/NowView.astro'],
  '/uses/': ['src/views/UsesView.astro'],
  '/contact/': ['src/views/ContactView.astro'],
  '/developers/': ['src/pages/developers.astro', 'src/lib/api-catalog.ts'],
};

const git = (args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim();

function isShallow() {
  try {
    return git(['rev-parse', '--is-shallow-repository']) !== 'false';
  } catch {
    return true;
  }
}

/** ISO date of the newest commit touching any of `files`, or undefined. */
const lastCommit = (files: string[]) => git(['log', '-1', '--format=%cI', '--', ...files]) || undefined;

const markdownIds = (dir: string) => readdirSync(dir).filter((f) => /\.mdx?$/.test(f));

/** Blog posts: updatedDate ?? pubDate from the front matter, so the sitemap agrees with the page. */
function postDates(dir: string) {
  return markdownIds(dir).map((file) => {
    const fm = readFileSync(join(dir, file), 'utf8').split('---')[1] ?? '';
    const date = fm.match(/^updatedDate:\s*(\S+)/m)?.[1] ?? fm.match(/^pubDate:\s*(\S+)/m)?.[1];
    return [`/blog/${file.replace(/\.mdx?$/, '')}/`, date && new Date(date).toISOString()] as const;
  });
}

function gitDates(): [string, string | undefined][] {
  if (isShallow()) return [];
  const projects = markdownIds('src/content/projects').map(
    (f) => [`/projects/${f.replace(/\.mdx?$/, '')}/`, [`src/content/projects/${f}`]] as const,
  );
  const areas = AREA_IDS.map((id) => [`/what-i-do/${id}/`, ['src/views/WhatIDoView.astro', 'src/data/areas.ts']] as const);
  return [...Object.entries(PAGE_SOURCES), ...projects, ...areas].map(([path, files]) => [path, lastCommit([...files])]);
}

const newest = (dates: Record<string, string>, prefix: string) =>
  Object.entries(dates)
    .filter(([path]) => path.startsWith(prefix))
    .map(([, date]) => date)
    .sort((a, b) => Date.parse(a) - Date.parse(b))
    .at(-1);

/** Unlocalized page path ("/services/") -> ISO date it last changed. Listings take their newest entry's date. */
export function pageDates(): Record<string, string> {
  const all = [...gitDates(), ...postDates('src/content/blog')];
  const dates = Object.fromEntries(all.filter((e): e is [string, string] => Boolean(e[1])));
  for (const listing of ['/blog/', '/projects/']) {
    const date = newest(dates, listing);
    if (date) dates[listing] = date;
  }
  return dates;
}

/** Looks a sitemap URL up in `dates`, ignoring the origin and the /da prefix. */
export function lastmodFor(dates: Record<string, string>, url: string) {
  const path = new URL(url).pathname.replace(/^\/da(?=\/)/, '');
  return dates[path.endsWith('/') ? path : `${path}/`];
}
