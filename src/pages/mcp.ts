// MCP endpoint for AI agents (Streamable HTTP, stateless, read-only).
// Protocol in src/lib/mcp.ts, tools in src/lib/mcp-tools.ts.
import type { APIRoute } from 'astro';
import { handlePost, MCP_CORS } from '../lib/mcp';
import { mcpTools } from '../lib/mcp-tools';
import { loadCatalog } from '../lib/content';

export const prerender = false;

export const POST: APIRoute = ({ request, site, url }) => handlePost(request, mcpTools, () => loadCatalog(site ?? url));

export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: MCP_CORS });

/** No server-initiated stream: the transport lets a server answer GET with 405. */
export const GET: APIRoute = () =>
  new Response(null, { status: 405, headers: { ...MCP_CORS, Allow: 'POST, OPTIONS' } });
