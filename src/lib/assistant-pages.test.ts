import { expect, it, vi } from 'vitest';
import { markdownPathOf, readPage } from './assistant-pages';
import { ASSISTANT_LIMITS } from '../data/assistant';

it('markdownPathOf: maps a page path to its Markdown twin', () => {
  expect(markdownPathOf('/services')).toBe('/services/index.md');
  expect(markdownPathOf('/da/projects/foundry/')).toBe('/da/projects/foundry/index.md');
  expect(markdownPathOf('/')).toBe('/index.md');
});

it.each(['https://evil.example/', '//evil.example/x', '/../secrets', '/a/../b', 'services', '/a%2e%2e/b', 42])(
  'refuses %s',
  (raw) => expect(markdownPathOf(raw)).toBeNull(),
);

it('readPage: cuts long pages so one read cannot fill the context', async () => {
  const long = 'x'.repeat(ASSISTANT_LIMITS.maxPageChars + 10);
  const fetchPage = vi.fn(async () => new Response(long));
  const page = await readPage({ path: '/blog/long' }, fetchPage);
  expect(page).toMatchObject({ truncated: true, markdown: long.slice(0, ASSISTANT_LIMITS.maxPageChars) });
});

it('readPage: never fetches a rejected path', async () => {
  const fetchPage = vi.fn(async () => new Response(''));
  expect(await readPage({ path: 'http://169.254.169.254/' }, fetchPage)).toHaveProperty('error');
  expect(fetchPage).not.toHaveBeenCalled();
});

it('readPage: refuses HTML, so the model never gets raw markup instead of page text', async () => {
  const html = async () => new Response('<html>', { headers: { 'Content-Type': 'text/html' } });
  expect(await readPage({ path: '/services' }, html)).toHaveProperty('error');
});

it('readPage: reports a missing page instead of returning the 404 body', async () => {
  const page = await readPage({ path: '/nope' }, async () => new Response('Not found', { status: 404 }));
  expect(page).toEqual({ error: 'No page at /nope' });
});
