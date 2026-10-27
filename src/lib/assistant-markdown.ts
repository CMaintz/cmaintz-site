// The small Markdown subset the assistant may answer in: paragraphs, lists,
// **bold** and links. Parsed to plain data the widget turns into DOM nodes,
// never into innerHTML, because the text comes from a model.

export type Inline = { t: 'text'; v: string } | { t: 'bold'; v: string } | { t: 'link'; v: string; href: string };
export type Block = { t: 'p'; inline: Inline[] } | { t: 'ul' | 'ol'; items: Inline[][] };

const INLINE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
const BULLET = /^\s*[-*]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

/** Same-site paths, https and mailto only: a link from the model must not run script. */
export function safeHref(href: string) {
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  return /^(https:\/\/|mailto:)/i.test(href) ? href : null;
}

function link(label: string, href: string): Inline {
  const safe = safeHref(href);
  return safe ? { t: 'link', v: label, href: safe } : { t: 'text', v: label };
}

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let at = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > at) out.push({ t: 'text', v: text.slice(at, m.index) });
    out.push(m[1] !== undefined ? { t: 'bold', v: m[1] } : link(m[2], m[3]));
    at = m.index + m[0].length;
  }
  if (at < text.length) out.push({ t: 'text', v: text.slice(at) });
  return out;
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
