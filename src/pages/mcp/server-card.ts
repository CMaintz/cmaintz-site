// The MCP Server Card at <streamable-http-url>/server-card, the location MCP reserves for it.
import { serverCardRoute } from '../../lib/mcp-card';

export const prerender = false;

export const { GET, HEAD, OPTIONS } = serverCardRoute();
