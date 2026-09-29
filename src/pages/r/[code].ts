import type { APIRoute } from 'astro';
import { isCode, landingUrl, resolveLink } from '../../lib/links';

export const prerender = false;

const noStore = (location: URL) => new Response(null, { status: 302, headers: { Location: location.href, 'Cache-Control': 'no-store' } });

/** Unknown or broken codes land on the homepage, untracked. */
export const GET: APIRoute = async ({ params, request }) => {
  const target = isCode(params.code) ? await resolveLink(params.code, request) : null;
  return noStore(target ? landingUrl(target, params.code!, request.url) : new URL('/', request.url));
};

// Scanners often send HEAD first; isBot() flags anything that isn't a GET.
export const HEAD = GET;
