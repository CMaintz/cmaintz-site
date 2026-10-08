// Worker entry: Astro's Cloudflare handler, plus Markdown content negotiation.
// A request with `Accept: text/markdown` gets the page's prebuilt index.md
// (src/lib/markdown-pages.ts); everything else goes to Astro unchanged.
import astro from '@astrojs/cloudflare/entrypoints/server';
import { SECURITY_HEADERS } from './lib/security-headers';

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

/** HTML varies by Accept now, so shared caches must key on it. */
function varyOnAccept(res: Response) {
  if (!res.headers.get('content-type')?.includes('text/html')) return res;
  const out = new Response(res.body, res);
  out.headers.append('Vary', 'Accept');
  return out;
}

export default {
  async fetch(request: Request, env: Env, ctx: Parameters<typeof astro.fetch>[2]) {
    const md = wantsMarkdown(request) ? await markdown(request, env) : null;
    return md ?? varyOnAccept(await astro.fetch(request, env, ctx));
  },
};
