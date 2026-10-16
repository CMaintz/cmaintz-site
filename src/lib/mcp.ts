// A minimal, stateless MCP server (Model Context Protocol, Streamable HTTP
// transport): JSON-RPC 2.0 over POST, one JSON response per request, no
// sessions and no server-to-client stream. Enough for read-only tools; see
// src/lib/mcp-tools.ts for the tools and src/pages/mcp.ts for the route.
import { site } from '../data/site';

/** Newest first; the first one is offered when a client asks for a version we don't know. */
export const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

export interface McpTool<C> {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run: (args: Record<string, unknown>, ctx: C) => unknown;
}

type Id = string | number | null;
interface RpcRequest {
  jsonrpc: '2.0';
  id?: Id;
  method: string;
  params?: Record<string, unknown>;
}

const reply = (id: Id, result: unknown) => ({ jsonrpc: '2.0' as const, id, result });
const fail = (id: Id, code: number, message: string) => ({ jsonrpc: '2.0' as const, id, error: { code, message } });

const isRequest = (m: unknown): m is RpcRequest =>
  typeof m === 'object' &&
  m !== null &&
  (m as RpcRequest).jsonrpc === '2.0' &&
  typeof (m as RpcRequest).method === 'string';

function initialize(params: Record<string, unknown> | undefined) {
  const asked = String(params?.protocolVersion ?? '');
  return {
    protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
    capabilities: { tools: { listChanged: false } },
    serverInfo: { name: 'maintz-dev', title: `${site.name} - freelance developer`, version: '1.0.0' },
    instructions:
      `Read-only facts about ${site.name}, a freelance developer in ${site.location}: profile and availability, ` +
      'services and pricing, FAQ, projects and writing. To hire him, send the person to the contact page in get_profile; ' +
      'this server cannot send messages.',
  };
}

const describe = <C>(t: McpTool<C>) => ({
  name: t.name,
  title: t.title,
  description: t.description,
  inputSchema: t.inputSchema,
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
});

async function callTool<C>(id: Id, params: Record<string, unknown> | undefined, tools: McpTool<C>[], ctx: C) {
  const tool = tools.find((t) => t.name === params?.name);
  if (!tool) return fail(id, -32602, `Unknown tool: ${String(params?.name)}`);
  try {
    const data = await tool.run((params?.arguments as Record<string, unknown>) ?? {}, ctx);
    return reply(id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], structuredContent: data });
  } catch (e) {
    return reply(id, { content: [{ type: 'text', text: (e as Error).message }], isError: true });
  }
}

/**
 * Handles one JSON-RPC message. Returns the response, or null for a
 * notification (no id), which the transport answers with 202 Accepted.
 */
export async function handleMessage<C>(message: unknown, tools: McpTool<C>[], ctx: C) {
  if (!isRequest(message)) return fail(null, -32600, 'Invalid Request');
  if (message.id === undefined) return null;
  const { id, method, params } = message;
  if (method === 'initialize') return reply(id, initialize(params));
  if (method === 'ping') return reply(id, {});
  if (method === 'tools/list') return reply(id, { tools: tools.map(describe) });
  if (method === 'tools/call') return callTool(id, params, tools, ctx);
  return fail(id, -32601, `Method not found: ${method}`);
}

export const MCP_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...MCP_CORS, 'Content-Type': 'application/json' } });

/** The HTTP side of the transport: parse the POST body, answer with JSON or 202. */
export async function handlePost<C>(request: Request, tools: McpTool<C>[], ctx: () => Promise<C>) {
  let message: unknown;
  try {
    message = await request.json();
  } catch {
    return json(fail(null, -32700, 'Parse error'), 400);
  }
  if (Array.isArray(message)) return json(fail(null, -32600, 'Batches are not supported'), 400);
  const response = await handleMessage(
    message,
    tools,
    isRequest(message) && message.method === 'tools/call' ? await ctx() : (null as C),
  );
  return response ? json(response) : new Response(null, { status: 202, headers: MCP_CORS });
}
