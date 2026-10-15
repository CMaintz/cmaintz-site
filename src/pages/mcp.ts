// MCP endpoint for AI agents (Streamable HTTP, stateless, read-only).
// Protocol in src/lib/mcp.ts, tools in src/lib/mcp-tools.ts.
import type { APIRoute } from 'astro';
import { handlePost, MCP_CORS } from '../lib/mcp';
import { mcpTools, type McpCatalog } from '../lib/mcp-tools';
import { getPosts, getProjects } from '../lib/content';

export const prerender = false;

async function catalog(base: URL): Promise<McpCatalog> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  return {
    base,
    projects: projects.map((p) => ({ id: p.id, ...p.data })),
    posts: posts.map((p) => ({ id: p.id, ...p.data })),
  };
}

export const POST: APIRoute = ({ request, site, url }) => handlePost(request, mcpTools, () => catalog(site ?? url));

export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: MCP_CORS });

/** No server-initiated stream: the transport lets a server answer GET with 405. */
export const GET: APIRoute = () =>
  new Response(null, { status: 405, headers: { ...MCP_CORS, Allow: 'POST, OPTIONS' } });
