// The small Markdown subset the assistant may answer in: paragraphs, lists,
// **bold**, *emphasis* and links. Parsed to plain data the widget turns into
// DOM nodes, never into innerHTML, because the text comes from a model.

type Leaf = { t: 'text'; v: string } | { t: 'link'; v: string; href: string };
export type Inline = Leaf | { t: 'bold' | 'em'; v: Leaf[] };
export type Block = { t: 'p'; inline: Inline[] } | { t: 'ul' | 'ol'; items: Inline[][] };

// Models often bold a whole link, so bold and emphasis may contain links.
const STYLED = /\*\*(.+?)\*\*|(?<![*\w])\*(?![\s*])([^*\n]*?[^*\s])\*(?!\*)|\[([^\]]+)\]\(([^)\s]+)\)/g;
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const BULLET = /^\s*[-*]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

/** Same-site paths, https and mailto only: a link from the model must not run script. */
export function safeHref(href: string) {
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  return /^(https:\/\/|mailto:)/i.test(href) ? href : null;
}

function link(label: string, href: string): Leaf {
  const safe = safeHref(href);
  return safe ? { t: 'link', v: label, href: safe } : { t: 'text', v: label };
}

/** Splits text on `re`, turning each match into a node and the gaps into text. */
function scan<T>(text: string, re: RegExp, node: (m: RegExpExecArray) => T | Leaf): (T | Leaf)[] {
  const out: (T | Leaf)[] = [];
  let at = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > at) out.push({ t: 'text', v: text.slice(at, m.index) });
    out.push(node(m));
    at = m.index + m[0].length;
  }
  if (at < text.length) out.push({ t: 'text', v: text.slice(at) });
  return out;
}

const links = (text: string): Leaf[] => scan(text, LINK, (m) => link(m[1], m[2]));

export function parseInline(text: string): Inline[] {
  return scan<Inline>(text, STYLED, (m) => {
    if (m[1] !== undefined) return { t: 'bold', v: links(m[1]) };
    if (m[2] !== undefined) return { t: 'em', v: links(m[2]) };
    return link(m[3], m[4]);
  });
}

function listOf(lines: string[], marker: RegExp, t: 'ul' | 'ol'): Block {
  return { t, items: lines.map((l) => parseInline(l.replace(marker, ''))) };
}

function block(chunk: string): Block {
  const lines = chunk.split('\n').filter((l) => l.trim());
  if (lines.every((l) => BULLET.test(l))) return listOf(lines, BULLET, 'ul');
  if (lines.every((l) => NUMBERED.test(l))) return listOf(lines, NUMBERED, 'ol');
  return { t: 'p', inline: parseInline(lines.join('\n')) };
}

/** Blank lines separate blocks; a run of list lines is one list. */
export function parseMarkdown(md: string): Block[] {
  const spaced = md.replace(/\r\n/g, '\n').replace(/\n(?=\s*(?:[-*]|\d+[.)])\s)/g, '\n\n');
  const merged = spaced.replace(/^(\s*(?:[-*]|\d+[.)])\s.*)\n\n(?=\s*(?:[-*]|\d+[.)])\s)/gm, '$1\n');
  return merged
    .split(/\n{2,}/)
    .filter((c) => c.trim())
    .map(block);
}
