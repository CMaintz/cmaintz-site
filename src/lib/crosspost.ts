// Pure helpers for scripts/crosspost.mjs: turn a blog post's MDX source into what
// each platform needs, and decide what to create or update. No network or disk here.
import type { CrosspostTarget } from '../data/crosspost';
// The .ts extension lets scripts/crosspost.mjs load this under Node's plain type stripping.
import { TAGS } from '../data/tags.ts';

export interface PostMeta {
  slug: string;
  lang: 'en' | 'da';
  title: string;
  description: string;
  pubDate: Date;
  tags: string[];
  draft: boolean;
  crosspost: CrosspostTarget[];
}

export interface Post {
  meta: PostMeta;
  body: string;
}

type DevtoAction = { kind: 'create'; post: Post } | { kind: 'update'; post: Post; id: number };

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Splits MDX source into front matter (parsed by the caller's YAML parser) and body. */
export function splitPost(source: string, parseYaml: (s: string) => unknown) {
  const m = source.match(FRONT_MATTER);
  return { data: (m ? parseYaml(m[1]) : {}) as Record<string, unknown>, body: m ? source.slice(m[0].length) : source };
}

export function toMeta(slug: string, data: Record<string, unknown>): PostMeta {
  return {
    slug,
    lang: data.lang === 'da' ? 'da' : 'en',
    title: String(data.title ?? slug),
    description: String(data.description ?? ''),
    pubDate: new Date(String(data.pubDate)),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: data.draft === true,
    crosspost: Array.isArray(data.crosspost) ? (data.crosspost as CrosspostTarget[]) : [],
  };
}

export const isLive = (m: PostMeta, now: Date) => !m.draft && m.pubDate.valueOf() <= now.valueOf();
export const postUrl = (site: string, m: PostMeta) =>
  `${site.replace(/\/$/, '')}${m.lang === 'da' ? '/da' : ''}/blog/${m.slug}`;
export const wants = (m: PostMeta, target: CrosspostTarget) => m.crosspost.includes(target);

/** Drops MDX import/export lines; components are supplied by the site, not the post. */
export const stripEsm = (md: string) => md.replace(/^(import|export)\s.*$\n?/gm, '');

/** <Callout title="T">body</Callout> becomes a blockquote, since other platforms can't render it. */
export function calloutsToQuotes(md: string) {
  return md.replace(/<Callout\b([^>]*)>([\s\S]*?)<\/Callout>/g, (_, attrs: string, inner: string) => {
    const title = attrs.match(/title="([^"]*)"/)?.[1];
    const lines = inner.trim().split('\n').map((l) => (l ? `> ${l}` : '>'));
    return [title ? `> **${title}**\n>` : '', ...lines].filter(Boolean).join('\n');
  });
}

/** Site-relative links and images (/projects/x) point back at the site. */
export function absolutize(md: string, site: string) {
  const base = site.replace(/\/$/, '');
  return md.replace(/\]\((\/[^)\s]*)/g, `](${base}$1`).replace(/(src|href)="(\/[^"]*)"/g, `$1="${base}$2"`);
}

const decodeAttr = (s: string) => s.replace(/&(?:quot|#x22|#34);/g, '"').replace(/&amp;/g, '&');
// dev.to runs Liquid over the KaTeX body too, so "{{" would open a Liquid variable.
const katex = (tex: string) => decodeAttr(tex).replace(/\{(?=\{)/g, '{ ');

/** <Math> and <InlineMath> become dev.to's KaTeX Liquid tags. */
function mathToKatex(prose: string) {
  return prose
    .replace(/<Math\s+expr="([^"]*)"\s*\/>/g, (_, tex: string) => `{% katex %}\n${katex(tex)}\n{% endkatex %}`)
    .replace(/<InlineMath\s+expr="([^"]*)"\s*\/>/g, (_, tex: string) => `{% katex inline %}${katex(tex)}{% endkatex %}`);
}

/**
 * Keeps only a fence's language: Expressive Code meta (title="...", {3}) would read as part
 * of it on dev.to. Mermaid, which dev.to doesn't render, becomes an image from mermaid.ink.
 */
function devtoFence(ticks: string, info: string, code: string) {
  const lang = info.trim().split(/\s+/)[0];
  if (lang === 'mermaid') return `![Diagram](https://mermaid.ink/img/${Buffer.from(code.trim()).toString('base64url')})`;
  return `${ticks}${lang}\n${code}${ticks}`;
}

const FENCE = /^(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)^\1[^\S\n]*$/gm;

/** Rewrites site-only syntax for dev.to, leaving the contents of code fences as written. */
export function devtoMarkdown(md: string) {
  let out = '';
  let last = 0;
  for (const m of md.matchAll(FENCE)) {
    out += mathToKatex(md.slice(last, m.index)) + devtoFence(m[1], m[2], m[3]);
    last = m.index + m[0].length;
  }
  return out + mathToKatex(md.slice(last));
}

function devtoBody(post: Post, site: string) {
  const md = absolutize(devtoMarkdown(calloutsToQuotes(stripEsm(post.body))), site).trim();
  return `${md}\n\n---\n\n*Originally published at [maintz.dev](${postUrl(site, post.meta)}).*\n`;
}

const DEVTO_TAG = new Map<string, string>(TAGS.flatMap((t) => ('devto' in t ? [[t.id, t.devto]] : [])));
const PRIORITY = new Map<string, number>(TAGS.map((t, i) => [t.id, i]));

/** A post's dev.to tags: the first four distinct ones its site tags map to, in src/data/tags.ts order. */
export function devtoTags(tags: string[]) {
  const ranked = [...tags].sort((a, b) => (PRIORITY.get(a) ?? Infinity) - (PRIORITY.get(b) ?? Infinity));
  return [...new Set(ranked.flatMap((t) => DEVTO_TAG.get(t) ?? []))].slice(0, 4);
}

export function devtoArticle(post: Post, site: string, mainImage?: string) {
  return {
    article: {
      title: post.meta.title,
      body_markdown: devtoBody(post, site),
      published: true,
      canonical_url: postUrl(site, post.meta),
      description: post.meta.description,
      tags: devtoTags(post.meta.tags),
      ...(mainImage ? { main_image: mainImage } : {}),
    },
  };
}

/**
 * Live posts that opted into dev.to: create when no article has this canonical URL yet,
 * update only when the post changed in this push (so a re-run doesn't rewrite everything).
 */
export function planDevto(posts: Post[], existing: Map<string, number>, changed: Set<string>, site: string, now: Date) {
  const actions: DevtoAction[] = [];
  for (const post of posts) {
    if (!wants(post.meta, 'devto') || !isLive(post.meta, now)) continue;
    const id = existing.get(postUrl(site, post.meta));
    if (id === undefined) actions.push({ kind: 'create', post });
    else if (changed.has(post.meta.slug)) actions.push({ kind: 'update', post, id });
  }
  return actions;
}

/**
 * A starting point for the LinkedIn post; it's edited and posted by hand. Hashtags reuse the
 * dev.to mapping, since both want short, followed tags.
 */
export function linkedinDraft(meta: PostMeta, site: string) {
  const hashtags = devtoTags(meta.tags).map((t) => `#${t}`).join(' ');
  return [meta.title, '', meta.description, '', `Full post: ${postUrl(site, meta)}`, '', hashtags].join('\n').trim();
}

export const linkedinMarker = (slug: string) => `<!-- crosspost:linkedin:${slug} -->`;
