// Build step: writes a Markdown twin (`index.md`) next to every prerendered page,
// so src/worker.ts can answer `Accept: text/markdown` without scraping HTML.
// Only the page's <main> is kept; scripts, forms, media and decoration are dropped.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import type { Element, Root, RootContent } from 'hast';

const DROP = new Set([
  'script',
  'style',
  'template',
  'svg',
  'noscript',
  'form',
  'button',
  'iframe',
  'video',
  'canvas',
  'dialog',
]);
const SKIP_DIRS = new Set(['_astro', 'doom', 'pagefind', 'og', 'img', 'media']);

const isElement = (n: RootContent): n is Element => n.type === 'element';
const hidden = (el: Element) =>
  DROP.has(el.tagName) || el.properties.ariaHidden === 'true' || el.properties.hidden != null;

function prune<T extends { children: RootContent[] }>(node: T): T {
  node.children = node.children.filter((c) => !(isElement(c) && hidden(c)));
  for (const c of node.children) if (isElement(c)) prune(c);
  return node;
}

function findTag(node: { children: RootContent[] }, tag: string): Element | undefined {
  for (const c of node.children) {
    if (!isElement(c)) continue;
    if (c.tagName === tag) return c;
    const hit = findTag(c, tag);
    if (hit) return hit;
  }
}

const text = (el: Element | undefined): string =>
  el ? el.children.map((c) => (c.type === 'text' ? c.value : isElement(c) ? text(c) : '')).join('') : '';

/** Swaps the document for its <main>, keeping the <title> for the front matter. */
const rehypeMain = () => (tree: Root, file: { data: Record<string, unknown> }) => {
  file.data.title = text(findTag(tree, 'title')).trim();
  return prune({ type: 'root', children: findTag(tree, 'main')?.children ?? [] } as Root);
};

const processor = unified().use(rehypeParse).use(rehypeMain).use(rehypeRemark).use(remarkGfm).use(remarkStringify);

export async function htmlToMarkdown(html: string, url: string) {
  const file = await processor.process(html);
  const title = String(file.data.title ?? '').replaceAll('"', '\\"');
  return `---\ntitle: "${title}"\nurl: ${url}\n---\n\n${String(file)}`;
}

async function pageDirs(root: string, rel = ''): Promise<string[]> {
  const entries = await readdir(join(root, rel), { withFileTypes: true });
  const here = entries.some((e) => e.name === 'index.html') ? [rel] : [];
  const subdirs = entries.filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name)).map((e) => join(rel, e.name));
  return [...here, ...(await Promise.all(subdirs.map((d) => pageDirs(root, d)))).flat()];
}

/** Writes `<page>/index.md` for every `<page>/index.html` under `root` (dist/client). */
export async function writeMarkdownPages(root: string, site: string) {
  const dirs = await pageDirs(root);
  await Promise.all(
    dirs.map(async (rel) => {
      const html = await readFile(join(root, rel, 'index.html'), 'utf8');
      await writeFile(
        join(root, rel, 'index.md'),
        await htmlToMarkdown(html, new URL(rel ? `/${rel}/` : '/', site).toString()),
      );
    }),
  );
  return dirs.length;
}
