// MCP Server Card and AI Catalog (SEP-2127), so clients can find and configure
// /mcp before connecting. Wire format and discovery rules:
// https://github.com/modelcontextprotocol/ext-server-card (schema.ts, docs/discovery.md)
import type { APIRoute } from 'astro';
import { API_PATHS, MCP_CARD_TYPE } from './api-catalog';
import { MCP_SERVER, PROTOCOL_VERSIONS } from './mcp';

const CATALOG_TYPE = 'application/ai-catalog+json';

export function serverCard(base: URL) {
  const abs = (path: string) => new URL(path, base).toString();
  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
    ...MCP_SERVER,
    description: 'Read-only facts about a freelance developer in Denmark: services, pricing, projects, posts.',
    websiteUrl: abs(`${API_PATHS.docs}#mcp`),
    repository: { url: 'https://github.com/CMaintz/cmaintz-site', source: 'github' },
    icons: [{ src: abs('/favicon.svg'), mimeType: 'image/svg+xml', sizes: ['any'] }],
    remotes: [{ type: 'streamable-http', url: abs(API_PATHS.mcp), supportedProtocolVersions: PROTOCOL_VERSIONS }],
  };
}

export function aiCatalog(base: URL) {
  return {
    specVersion: '1.0',
    entries: [
      {
        identifier: `urn:air:${base.host}:mcp:site`,
        type: MCP_CARD_TYPE,
        url: new URL(API_PATHS.mcpCard, base).toString(),
      },
    ],
  };
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
  'Access-Control-Expose-Headers': 'ETag',
};

async function etagOf(text: string) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  return `"${Array.from(digest.subarray(0, 8), (b) => b.toString(16).padStart(2, '0')).join('')}"`;
}

/**
 * If-None-Match uses weak comparison (RFC 9110 13.1.2): Cloudflare turns the
 * ETag into W/"..." when it compresses, and clients send that form back.
 */
const notModified = (ifNoneMatch: string | null, etag: string) =>
  ifNoneMatch?.split(',').some((tag) => ['*', etag].includes(tag.trim().replace(/^W\//, ''))) ?? false;

/** A public discovery document with the CORS, caching and ETag revalidation the spec asks hosts for. */
export async function discoveryResponse(request: Request, body: unknown, type: string) {
  const text = JSON.stringify(body, null, 2);
  const headers = { ...CORS, 'Content-Type': type, 'Cache-Control': 'public, max-age=3600', ETag: await etagOf(text) };
  if (notModified(request.headers.get('If-None-Match'), headers.ETag)) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(request.method === 'HEAD' ? null : text, { headers });
}

function discoveryRoute(build: (base: URL) => unknown, type: string) {
  const GET: APIRoute = ({ request, site, url }) => discoveryResponse(request, build(site ?? url), type);
  const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: CORS });
  return { GET, HEAD: GET, OPTIONS };
}

export const serverCardRoute = () => discoveryRoute(serverCard, MCP_CARD_TYPE);
export const aiCatalogRoute = () => discoveryRoute(aiCatalog, CATALOG_TYPE);
