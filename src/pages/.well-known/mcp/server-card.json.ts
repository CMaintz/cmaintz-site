// The same card again at the pre-SEP-2127 location, which scanners such as
// https://isitagentready.com still probe instead of following the AI Catalog.
// Remove once they look up /.well-known/ai-catalog.json.
import { serverCardRoute } from '../../../lib/mcp-card';

export const prerender = false;

export const { GET, HEAD, OPTIONS } = serverCardRoute();
