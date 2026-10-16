import { describe, expect, it } from 'vitest';
import { MCP_CARD_TYPE } from './api-catalog';
import { handleMessage, PROTOCOL_VERSIONS } from './mcp';
import { aiCatalog, discoveryResponse, serverCard } from './mcp-card';

const base = new URL('https://maintz.dev');

describe('serverCard (SEP-2127)', () => {
  it('matches what initialize reports, as clients prefer the live values', async () => {
    const res = (await handleMessage({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }, [], null)) as {
      result: { serverInfo: Record<string, string> };
    };
    const { name, title, version } = serverCard(base);
    expect({ name, title, version }).toEqual(res.result.serverInfo);
  });

  it('meets the schema limits clients validate against', () => {
    const card = serverCard(base);
    expect(card.name).toMatch(/^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/);
    expect(card.description.length).toBeLessThanOrEqual(100);
    expect(card.title.length).toBeLessThanOrEqual(100);
  });
});

describe('serverCard remotes', () => {
  it('points at the streamable HTTP endpoint with every protocol version it accepts', () => {
    expect(serverCard(base).remotes).toEqual([
      { type: 'streamable-http', url: 'https://maintz.dev/mcp', supportedProtocolVersions: PROTOCOL_VERSIONS },
    ]);
  });
});

describe('aiCatalog', () => {
  it('links the server card at the location MCP reserves for it', () => {
    expect(aiCatalog(base).entries).toEqual([
      { identifier: 'urn:air:maintz.dev:mcp:site', type: MCP_CARD_TYPE, url: 'https://maintz.dev/mcp/server-card' },
    ]);
  });
});

const get = (headers: Record<string, string> = {}) =>
  discoveryResponse(new Request('https://maintz.dev/mcp/server-card', { headers }), { a: 1 }, MCP_CARD_TYPE);

describe('discoveryResponse revalidation', () => {
  it('answers 304 when the client already has this version', async () => {
    const etag = (await get()).headers.get('ETag')!;
    const res = await get({ 'If-None-Match': etag });
    expect(res.status).toBe(304);
    expect(await res.text()).toBe('');
  });

  it('matches the weak ETag Cloudflare hands back after compressing, inside a list', async () => {
    const etag = (await get()).headers.get('ETag')!;
    expect((await get({ 'If-None-Match': `"other", W/${etag}` })).status).toBe(304);
  });
});

describe('discoveryResponse body', () => {
  it('sends the body with its media type for a stale ETag', async () => {
    const res = await get({ 'If-None-Match': '"stale"' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ a: 1 });
    expect(res.headers.get('Content-Type')).toBe(MCP_CARD_TYPE);
  });
});
