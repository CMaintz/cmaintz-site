import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import {
  absolutize,
  calloutsToQuotes,
  devtoArticle,
  devtoMarkdown,
  devtoTags,
  linkedinDraft,
  planDevto,
  splitPost,
  stripEsm,
  toMeta,
  type Post,
} from './crosspost';

const SITE = 'https://maintz.dev';
const NOW = new Date('2026-10-11T12:00:00Z');

const source = `---
title: One rule set
description: Why CI and AI standards are one thing.
pubDate: 2026-09-28
tags: [ci, developer-experience, foundry, devops, ai]
crosspost: [devto, linkedin]
---

import Callout from '../../components/Callout.astro';

See [Foundry](/projects/foundry) and ![x](/img/a.png).

<Callout type="note" title="The exit code is the evidence">
"The model says it fixed it" is not evidence.

The exit code is.
</Callout>
`;

function post(slug: string, data: Record<string, unknown>): Post {
  return { meta: toMeta(slug, { title: slug, pubDate: '2026-09-01', ...data }), body: 'Body' };
}

describe('parsing', () => {
  it('splits front matter and body, and normalises the meta', () => {
    const { data, body } = splitPost(source, parse);
    const meta = toMeta('one-rule-set', data);
    expect(meta.title).toBe('One rule set');
    expect(meta.crosspost).toEqual(['devto', 'linkedin']);
    expect(meta.draft).toBe(false);
    expect(body.startsWith('\nimport Callout')).toBe(true);
  });
});

describe('markdown for other platforms', () => {
  it('drops MDX imports', () => {
    expect(stripEsm("import X from 'y';\nText")).toBe('Text');
  });

  it('turns callouts into titled blockquotes, keeping blank lines inside', () => {
    expect(calloutsToQuotes('<Callout title="T">\nA\n\nB\n</Callout>')).toBe('> **T**\n>\n> A\n>\n> B');
    expect(calloutsToQuotes('<Callout type="tip">\nA\n</Callout>')).toBe('> A');
  });

  it('makes site-relative links and images absolute, leaving external ones alone', () => {
    const md = '[a](/projects/x) ![i](/img/a.png) [b](https://x.dev/p) <img src="/og.png">';
    expect(absolutize(md, SITE + '/')).toBe(
      '[a](https://maintz.dev/projects/x) ![i](https://maintz.dev/img/a.png) [b](https://x.dev/p) <img src="https://maintz.dev/og.png">',
    );
  });
});

const fence = '```';

describe('devtoMarkdown', () => {
  it('turns math components into KaTeX Liquid tags, keeping "{{" away from Liquid', () => {
    expect(devtoMarkdown('If <InlineMath expr="n_t" /> then\n\n<Math expr="\\frac{1}{{a}}" />')).toBe(
      'If {% katex inline %}n_t{% endkatex %} then\n\n{% katex %}\n\\frac{1}{ {a}}\n{% endkatex %}',
    );
  });

  it('renders Mermaid through mermaid.ink and keeps only the language of other fences', () => {
    const md = `${fence}mermaid title="Flow"\ngraph LR\n  A --> B\n${fence}\n${fence}ts title="a b" {3}\nx\n${fence}`;
    const img = `![Diagram](https://mermaid.ink/img/${Buffer.from('graph LR\n  A --> B').toString('base64url')})`;
    expect(devtoMarkdown(md)).toBe(`${img}\n${fence}ts\nx\n${fence}`);
  });

  it('leaves code samples alone, nested fences included', () => {
    const md = `${fence}\`md\n<Math expr="x" />\n${fence}ts title="inner"\n${fence}\n${fence}\``;
    expect(devtoMarkdown(md)).toBe(md);
  });
});

describe('devtoTags', () => {
  it('maps tags to dev.to in src/data/tags.ts order, dropping ones without an equivalent and duplicates', () => {
    expect(devtoTags(['jev', 'ai-assisted-development', 'llm', 'ai', 'unknown'])).toEqual(['ai', 'llm']);
  });
});

describe('dev.to article', () => {
  it('builds a dev.to article with canonical URL, cleaned tags and a back-link', () => {
    const { data, body } = splitPost(source, parse);
    const { article } = devtoArticle({ meta: toMeta('one-rule-set', data), body }, SITE, `${SITE}/og.png`);
    expect(article.canonical_url).toBe('https://maintz.dev/blog/one-rule-set');
    expect(article.tags).toEqual(['ai', 'devops', 'tooling', 'cicd']);
    expect(article.main_image).toBe('https://maintz.dev/og.png');
    expect(article.body_markdown).not.toContain('import Callout');
    expect(article.body_markdown).toContain('> **The exit code is the evidence**');
    expect(article.body_markdown).toContain('(https://maintz.dev/projects/foundry)');
    expect(article.body_markdown).toContain(
      'Originally published at [maintz.dev](https://maintz.dev/blog/one-rule-set)',
    );
  });
});

describe('post URL', () => {
  it('points a Danish post at its /da/ address', () => {
    const meta = toMeta('fem-opgaver', { title: 'T', pubDate: '2026-10-13', lang: 'da' });
    const { article } = devtoArticle({ meta, body: 'Body' }, SITE, `${SITE}/og.png`);
    expect(article.canonical_url).toBe('https://maintz.dev/da/blog/fem-opgaver');
  });
});

const posts = [
  post('new', { crosspost: ['devto'] }),
  post('known-changed', { crosspost: ['devto'] }),
  post('known-same', { crosspost: ['devto'] }),
  post('not-opted', {}),
  post('draft', { crosspost: ['devto'], draft: true }),
  post('future', { crosspost: ['devto'], pubDate: '2026-12-01' }),
];
const existing = new Map([
  [`${SITE}/blog/known-changed`, 11],
  [`${SITE}/blog/known-same`, 12],
]);

describe('planDevto', () => {
  it('creates new, updates changed, and skips drafts, future posts and opt-outs', () => {
    const actions = planDevto(posts, existing, new Set(['known-changed', 'known-same-not']), SITE, NOW);
    expect(actions.map((a) => [a.kind, a.post.meta.slug, 'id' in a ? a.id : null])).toEqual([
      ['create', 'new', null],
      ['update', 'known-changed', 11],
    ]);
  });
});

describe('linkedinDraft', () => {
  it('includes the title, description, link and hashtags', () => {
    const text = linkedinDraft(
      toMeta('x', { title: 'T', description: 'D', pubDate: '2026-01-01', tags: ['ci'] }),
      SITE,
    );
    expect(text).toBe('T\n\nD\n\nFull post: https://maintz.dev/blog/x\n\n#cicd');
  });
});
