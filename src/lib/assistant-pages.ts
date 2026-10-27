// get_page for the site assistant: reads a page's prebuilt Markdown twin
// (src/lib/markdown-pages.ts). The path comes from the model, so it is
// checked to be a plain site path before anything is fetched.
import { withSlash } from '../i18n/ui';
import { ASSISTANT_LIMITS } from '../data/assistant';

/** Fetches a site-relative path; the route supplies one that never leaves the site. */
export type PageFetcher = (path: string) => Promise<Response>;

const SAFE_PATH = /^\/[a-z0-9\-/]{0,200}$/i;

/** A plain site path like /da/projects/foundry: no host, dots, query or doubled slash. */
export const isSitePath = (path: string) => SAFE_PATH.test(path) && !path.includes('//');

/** "/services" -> "/services/index.md"; null for anything that isn't a plain page path. */
export function markdownPathOf(raw: unknown) {
  if (typeof raw !== 'string') return null;
  const path = raw.trim().replace(/[?#].*$/, '');
  if (!isSitePath(path)) return null;
  return `${withSlash(path)}index.md`;
}

export async function readPage(args: Record<string, unknown>, fetchPage: PageFetcher) {
  const md = markdownPathOf(args.path);
  if (!md) return { error: 'Use a site path like /services or /da/projects/foundry' };
  const res = await fetchPage(md);
  if (!res.ok) return { error: `No page at ${String(args.path)}` };
  // Twins exist only after a build; under `astro dev` the page comes back as HTML.
  if (res.headers.get('content-type')?.includes('text/html')) return { error: 'Page text is not available here' };
  const text = await res.text();
  const max = ASSISTANT_LIMITS.maxPageChars;
  return { path: withSlash(String(args.path)), markdown: text.slice(0, max), truncated: text.length > max };
}
