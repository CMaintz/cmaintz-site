import type { APIRoute } from 'astro';
import { isCode, markSeen } from '../../lib/links';

export const prerender = false;

/** Beacon from the landing page: the body is the code, as text/plain. */
export const POST: APIRoute = async ({ request }) => {
  const code = (await request.text()).trim();
  if (isCode(code)) await markSeen(code, request);
  return new Response(null, { status: 204 });
};
