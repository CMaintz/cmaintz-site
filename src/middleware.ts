import { defineMiddleware } from 'astro:middleware';
import { SECURITY_HEADERS } from './lib/security-headers';

/** On-demand responses (the contact API) get the same headers as static pages. */
export const onRequest = defineMiddleware(async (_context, next) => {
  const res = await next();
  // Redirect responses have immutable headers, so copy before setting.
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
  return out;
});
