import { describe, expect, it } from 'vitest';
import { API_PATHS, apiCatalog, linkHeadersBlock, openApiSpec } from './api-catalog';

const base = new URL('https://maintz.dev');

describe('apiCatalog (RFC 9727)', () => {
  it('anchors each API and links its spec, docs and status', () => {
    const [entry] = apiCatalog(base).linkset;
    expect(entry.anchor).toBe('https://maintz.dev/api/contact');
    expect(entry['service-desc'][0].href).toBe('https://maintz.dev/openapi.json');
    expect(entry['service-doc'][0].href).toBe('https://maintz.dev/developers/');
    expect(entry.status[0].href).toBe('https://maintz.dev/api/health');
  });

  it('describes every catalogued path in the OpenAPI spec', () => {
    const paths = Object.keys(openApiSpec(base).paths);
    expect(paths).toEqual([API_PATHS.contact, API_PATHS.health]);
  });
});

describe('linkHeadersBlock (RFC 8288)', () => {
  it('advertises the catalog, spec, docs and description on the homepage', () => {
    const block = linkHeadersBlock();
    expect(block.startsWith('/\n  Link: ')).toBe(true);
    for (const rel of ['api-catalog', 'service-desc', 'service-doc', 'describedby']) expect(block).toContain(`rel="${rel}"`);
  });
});
