// RFC 9727 API catalog. Served by the Worker, not as a static asset, so the
// linkset media type and the Link header are exact.
import type { APIRoute } from 'astro';
import { API_PATHS, LINKSET_TYPE, apiCatalog } from '../../lib/api-catalog';

export const prerender = false;

const headers = {
  'Content-Type': LINKSET_TYPE,
  Link: `<${API_PATHS.catalog}>; rel="api-catalog"`,
  'Cache-Control': 'public, max-age=3600',
};

export const GET: APIRoute = ({ site, url }) =>
  new Response(JSON.stringify(apiCatalog(site ?? url), null, 2), { headers });

export const HEAD: APIRoute = () => new Response(null, { headers });
