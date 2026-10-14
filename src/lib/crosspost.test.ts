import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import {
  absolutize,
  calloutsToQuotes,
  devtoArticle,
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
tags: [ci, developer-experience, AI, foundry, extra]
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

describe('dev.to article', () => {
  it('builds a dev.to article with canonical URL, cleaned tags and a back-link', () => {
    const { data, body } = splitPost(source, parse);
    const { article } = devtoArticle({ meta: toMeta('one-rule-set', data), body }, SITE, `${SITE}/og.png`);
    expect(article.canonical_url).toBe('https://maintz.dev/blog/one-rule-set');
    expect(article.tags).toEqual(['ci', 'developerexperience', 'ai', 'foundry']);
    expect(article.main_image).toBe('https://maintz.dev/og.png');
    expect(article.body_markdown).not.toContain('import Callout');
    expect(article.body_markdown).toContain('> **The exit code is the evidence**');
    expect(article.body_markdown).toContain('(https://maintz.dev/projects/foundry)');
    expect(article.body_markdown).toContain('Originally published at [maintz.dev](https://maintz.dev/blog/one-rule-set)');
  });

  it('dedupes tags after cleaning', () => {
    expect(devtoTags(['C#', 'c', 'Dev-Ops', 'devops'])).toEqual(['c', 'devops']);
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
    const text = linkedinDraft(toMeta('x', { title: 'T', description: 'D', pubDate: '2026-01-01', tags: ['CI'] }), SITE);
    expect(text).toBe('T\n\nD\n\nFull post: https://maintz.dev/blog/x\n\n#ci');
  });
});
