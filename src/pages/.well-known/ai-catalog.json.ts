// AI Catalog: the domain-level entry point that lists the site's MCP server card.
import { aiCatalogRoute } from '../../lib/mcp-card';

export const prerender = false;

export const { GET, HEAD, OPTIONS } = aiCatalogRoute();
