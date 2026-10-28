import { expect, it } from 'vitest';
import { parseInline, parseMarkdown, safeHref } from './assistant-markdown';

it.each(['/services/', '/da/projects/foundry/', 'https://github.com/CMaintz', 'mailto:christoffer@maintz.dev'])(
  'keeps %s',
  (href) => expect(safeHref(href)).toBe(href),
);

it.each(['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,x', '//evil.example', 'http://plain.example'])(
  'drops %s',
  (href) => expect(safeHref(href)).toBeNull(),
);

it('parseInline: turns an unsafe link into its label only', () => {
  expect(parseInline('[click](javascript:alert`1`)')).toEqual([{ t: 'text', v: 'click' }]);
});

it('parseInline: keeps text around bold and links in order', () => {
  expect(parseInline('See **fixed prices** on [services](/services/).')).toEqual([
    { t: 'text', v: 'See ' },
    { t: 'bold', v: [{ t: 'text', v: 'fixed prices' }] },
    { t: 'text', v: ' on ' },
    { t: 'link', v: 'services', href: '/services/' },
    { t: 'text', v: '.' },
  ]);
});

it('parseInline: keeps a link that the model wrapped in bold', () => {
  expect(parseInline('- **[About page](/about/)** - his DevOps work')).toEqual([
    { t: 'text', v: '- ' },
    { t: 'bold', v: [{ t: 'link', v: 'About page', href: '/about/' }] },
    { t: 'text', v: ' - his DevOps work' },
  ]);
});

it('parseInline: reads single asterisks as emphasis, not literal stars', () => {
  expect(parseInline('*The range depends on the platform.*')).toEqual([
    { t: 'em', v: [{ t: 'text', v: 'The range depends on the platform.' }] },
  ]);
});

it('parseMarkdown: splits a paragraph and the list that follows it without a blank line', () => {
  const blocks = parseMarkdown('He has used:\n- Docker\n- Kubernetes');
  expect(blocks.map((b) => b.t)).toEqual(['p', 'ul']);
  expect(blocks[1]).toMatchObject({ items: [[{ v: 'Docker' }], [{ v: 'Kubernetes' }]] });
});

it('parseMarkdown: reads a numbered list as one list', () => {
  expect(parseMarkdown('1. Call\n2. Proposal\n3. Build')).toEqual([
    { t: 'ol', items: [[{ t: 'text', v: 'Call' }], [{ t: 'text', v: 'Proposal' }], [{ t: 'text', v: 'Build' }]] },
  ]);
});
