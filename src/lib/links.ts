// Tracked application links (maintz.dev/r/<code>). The Worker resolves codes
// and logs events through two Supabase functions; see
// supabase/migrations/0003_tracked_links.sql for the privacy and security model.
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from 'astro:env/client';

/** Six characters without look-alikes (no i, l, o, 0 or 1). */
export const isCode = (code: unknown): code is string => typeof code === 'string' && /^[a-hjkmnp-z2-9]{6}$/i.test(code);

// Link scanners and preview fetchers open links before (or instead of) a human.
const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|skype|microsoft office|outlook|safelinks|proofpoint|mimecast|barracuda|curl|wget|python|java\/|go-http|headless|phantom|node-fetch|axios/i;

export const isBot = (request: Request) => request.method !== 'GET' || BOT_UA.test(request.headers.get('user-agent') ?? '');

/** New Supabase keys (sb_...) go in the apikey header only; legacy JWT keys also as a bearer token. */
function authHeaders(key: string): Record<string, string> {
  return key.startsWith('sb_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T | null> {
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) return null;
  const res = await fetch(`${PUBLIC_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { ...authHeaders(PUBLIC_SUPABASE_ANON_KEY), 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  return res.ok ? ((await res.json()) as T) : null;
}

const country = (request: Request) => request.headers.get('cf-ipcountry');

/** The target path for a known code (logging a hit), or null. Never throws. */
export function resolveLink(code: string, request: Request) {
  return rpc<string>('resolve_link', { p_code: code, p_bot: isBot(request), p_country: country(request) }).catch(() => null);
}

/** Logs that a real browser landed via this code. Never throws. */
export function markSeen(code: string, request: Request) {
  return rpc<null>('link_seen', { p_code: code, p_country: country(request) }).catch(() => null);
}

/** The landing URL; its script reports `via` once and strips it from the address bar. */
export const landingUrl = (target: string, code: string, base: string) => new URL(`${target}?via=${code.toLowerCase()}`, base);
