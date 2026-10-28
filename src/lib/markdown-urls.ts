// Every page has a Markdown twin at `<page>/index.md` (markdown-pages.ts). Agents ask for it
// by appending `.md` to the page URL ("/services.md"), so llms.txt links that form and
// src/worker.ts maps it back to the twin.
import { withSlash } from '../i18n/ui';

export function markdownUrl(path: string) {
  const page = withSlash(path);
  if (!page.endsWith('/')) return path;
  return page === '/' ? '/index.md' : `${page.slice(0, -1)}.md`;
}

/** "/services" or "/services/" -> "/services/index.md". */
export const twinPath = (pagePath: string) => `${pagePath.replace(/\/$/, '')}/index.md`;

/**
 * The twin behind a `.md` page URL: "/services.md" (or "/services/.md") -> "/services/index.md".
 * Null for anything else, including a twin asked for by its own path, which is served as a file.
 */
export function markdownAsset(pathname: string) {
  if (!pathname.endsWith('.md') || pathname.endsWith('/index.md')) return null;
  return twinPath(pathname.slice(0, -3));
}
