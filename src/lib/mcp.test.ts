import { describe, expect, it } from 'vitest';
import { handleMessage, handlePost, PROTOCOL_VERSIONS } from './mcp';
import { mcpTools, type McpCatalog } from './mcp-tools';
import { HOURLY_RATE_DKK, services } from '../data/services';

const catalog: McpCatalog = {
  base: new URL('https://maintz.dev'),
  projects: [
    {
      id: 'foundry',
      title: 'Foundry',
      tagline: { en: 'Gate', da: 'Gate' },
      summary: { en: 'S', da: 'S' },
      areas: ['devops'],
      stack: ['TS'],
      featured: true,
    },
    {
      id: 'jev-tools',
      title: 'jev-tools',
      tagline: { en: 'Jev', da: 'Jev' },
      summary: { en: 'S', da: 'S' },
      areas: ['ai'],
      stack: ['TS'],
      featured: true,
    },
  ],
  posts: [
    { id: 'hello-world', title: 'Hello', description: 'D', pubDate: new Date('2026-09-27'), tags: ['meta'], lang: 'en' },
    { id: 'fem-opgaver', title: 'Fem', description: 'D', pubDate: new Date('2026-09-20'), tags: [], lang: 'da' },
  ],
};

const rpc = (method: string, params?: Record<string, unknown>, id: number | undefined = 1) =>
  handleMessage({ jsonrpc: '2.0', id, method, params }, mcpTools, catalog);

const callTool = async (name: string, args: Record<string, unknown> = {}) => {
  const res = (await rpc('tools/call', { name, arguments: args })) as {
    result: { structuredContent: any; content: { text: string }[] };
  };
  return res.result;
};

describe('MCP protocol', () => {
  it('negotiates the protocol version on initialize', async () => {
    const known = (await rpc('initialize', { protocolVersion: '2025-06-18' })) as any;
    expect(known.result.protocolVersion).toBe('2025-06-18');
    expect(known.result.capabilities).toEqual({ tools: { listChanged: false } });
    const unknown = (await rpc('initialize', { protocolVersion: '1999-01-01' })) as any;
    expect(unknown.result.protocolVersion).toBe(PROTOCOL_VERSIONS[0]);
  });

  it('lists every tool as read-only', async () => {
    const res = (await rpc('tools/list')) as any;
    expect(res.result.tools.map((t: { name: string }) => t.name)).toEqual(mcpTools.map((t) => t.name));
    for (const t of res.result.tools) expect(t.annotations.readOnlyHint).toBe(true);
  });
});

describe('MCP protocol errors', () => {
  it('answers notifications with nothing, and unknown methods and tools with errors', async () => {
    expect(await handleMessage({ jsonrpc: '2.0', method: 'notifications/initialized' }, mcpTools, catalog)).toBeNull();
    expect(((await rpc('resources/list')) as any).error.code).toBe(-32601);
    expect(((await rpc('tools/call', { name: 'send_email' })) as any).error.code).toBe(-32602);
    expect(((await handleMessage({ nope: true }, mcpTools, catalog)) as any).error.code).toBe(-32600);
  });
});

describe('MCP tools', () => {
  it('get_profile carries the rate and contact page', async () => {
    const { structuredContent, content } = await callTool('get_profile');
    expect(structuredContent.rate.hourly).toBe(HOURLY_RATE_DKK);
    expect(structuredContent.contact.page).toBe('https://maintz.dev/contact/');
    expect(JSON.parse(content[0].text)).toEqual(structuredContent);
  });

  it('list_services follows the language', async () => {
    const da = (await callTool('list_services', { lang: 'da' })).structuredContent;
    expect(da.services).toHaveLength(services.length);
    expect(da.services[0].title).toBe(services[0].title.da);
    expect(da.page).toBe('https://maintz.dev/da/services/');
  });
});

describe('MCP content tools', () => {
  it('list_projects filters by area and links canonical URLs', async () => {
    const { projects } = (await callTool('list_projects', { area: 'ai' })).structuredContent;
    expect(projects.map((p: { title: string }) => p.title)).toEqual(['jev-tools']);
    expect(projects[0].url).toBe('https://maintz.dev/projects/jev-tools/');
  });

  it('list_posts gives dates and canonical URLs', async () => {
    const { posts } = (await callTool('list_posts')).structuredContent;
    expect(posts[0]).toMatchObject({ published: '2026-09-27', url: 'https://maintz.dev/blog/hello-world/' });
    expect(posts[1]).toMatchObject({ lang: 'da', url: 'https://maintz.dev/da/blog/fem-opgaver/' });
  });
});

const post = (body: string) =>
  handlePost(
    new Request('https://maintz.dev/mcp', { method: 'POST', body, headers: { 'Content-Type': 'application/json' } }),
    mcpTools,
    async () => catalog,
  );

describe('MCP over HTTP', () => {
  it('returns JSON for requests and 202 for notifications', async () => {
    const res = await post(JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'ping' }));
    expect(res.headers.get('content-type')).toBe('application/json');
    expect(await res.json()).toEqual({ jsonrpc: '2.0', id: 7, result: {} });
    expect((await post(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }))).status).toBe(202);
  });
});

describe('MCP over HTTP: bad input', () => {
  it('rejects malformed bodies and batches', async () => {
    expect((await post('{nope')).status).toBe(400);
    expect((await post('[]')).status).toBe(400);
  });
});
