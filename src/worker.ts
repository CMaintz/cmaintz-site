// Worker entry: Astro's Cloudflare handler, plus two things pages need now that
// they run worker-first: a redirect to the canonical trailing-slash URL, and
// Markdown content negotiation. A request with `Accept: text/markdown` gets the
// page's prebuilt index.md (src/lib/markdown-pages.ts); the rest goes to Astro.
import astro from '@astrojs/cloudflare/entrypoints/server';
import { SECURITY_HEADERS } from './lib/security-headers';
import { withSlash } from './i18n/ui';

interface Env {
  ASSETS: { fetch(input: URL | Request): Promise<Response> };
}

const wantsMarkdown = (req: Request) =>
  (req.method === 'GET' || req.method === 'HEAD') && /\btext\/markdown\b/.test(req.headers.get('accept') ?? '');

const markdownPath = (pathname: string) => `${pathname.endsWith('/') ? pathname : `${pathname}/`}index.md`;

async function markdown(request: Request, env: Env) {
  const url = new URL(request.url);
  const res = await env.ASSETS.fetch(new URL(markdownPath(url.pathname), url));
  if (!res.ok) return null;
  const body = await res.text();
  const headers = new Headers({ ...SECURITY_HEADERS, 'Content-Type': 'text/markdown; charset=utf-8', Vary: 'Accept' });
  headers.set('x-markdown-tokens', String(Math.ceil(body.length / 4)));
  return new Response(request.method === 'HEAD' ? null : body, { headers });
}

// Endpoints keep their exact paths; `trailingSlash: 'always'` would break these.
const EXACT_PATHS = /^\/(api|\.well-known)\//;

/** "/services" -> 301 "/services/", as Cloudflare does for static pages it serves directly. */
function canonicalRedirect(request: Request) {
  const url = new URL(request.url);
  if ((request.method !== 'GET' && request.method !== 'HEAD') || EXACT_PATHS.test(url.pathname)) return null;
  const pathname = withSlash(url.pathname);
  if (pathname === url.pathname) return null;
  return new Response(null, { status: 301, headers: { Location: pathname + url.search } });
}

/** HTML varies by Accept now, so shared caches must key on it. */
function varyOnAccept(res: Response) {
  if (!res.headers.get('content-type')?.includes('text/html')) return res;
  const out = new Response(res.body, res);
  out.headers.append('Vary', 'Accept');
  return out;
}

export default {
  async fetch(request: Request, env: Env, ctx: Parameters<typeof astro.fetch>[2]) {
    const redirect = canonicalRedirect(request);
    if (redirect) return redirect;
    const md = wantsMarkdown(request) ? await markdown(request, env) : null;
    return md ?? varyOnAccept(await astro.fetch(request, env, ctx));
  },
};
