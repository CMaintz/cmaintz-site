// Cloudflare's rate-limit bindings (`ratelimits` in wrangler.jsonc), as the API routes use them.

export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/** True once `key` is over the limit. Without the binding (local dev) or a key, nothing is limited. */
export async function overLimit(limiter: RateLimiter | undefined, key: string | null) {
  if (!limiter || !key) return false;
  return !(await limiter.limit({ key })).success;
}
