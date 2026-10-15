// Rehype plugin: internal links in Markdown content ("/projects/foundry") get the
// canonical trailing slash ("/projects/foundry/"), like links built with localize().
import type { Element, Root, RootContent } from 'hast';
import { withSlash } from '../i18n/ui';

function visit(node: Root | Element) {
  for (const child of node.children as RootContent[]) {
    if (child.type !== 'element') continue;
    const href = child.properties.href;
    if (child.tagName === 'a' && typeof href === 'string' && href.startsWith('/') && !href.startsWith('//'))
      child.properties.href = withSlash(href);
    visit(child);
  }
}

export const rehypeCanonicalLinks = () => (tree: Root) => visit(tree);
