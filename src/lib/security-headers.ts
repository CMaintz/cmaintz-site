// Security headers for every response. Static pages get them through
// dist/client/_headers (written at build time by astro.config.mjs); on-demand
// routes get them from src/middleware.ts. One list, so the two can't drift.
//
// Scripts keep 'unsafe-inline': the theme bootstrap and Astro's small inlined
// scripts would otherwise need per-build hashes. The policy still limits where
// scripts, frames and requests can come from or go to.
const CSP = [
  "default-src 'self'",
  // wasm-unsafe-eval: Pagefind search and DOOM run WebAssembly. 'self' frames: DOOM.
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://giscus.app",
  "style-src 'self' 'unsafe-inline' https://giscus.app",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cloudflareinsights.com",
  "frame-src 'self' https://*.maintz.dev https://challenges.cloudflare.com https://giscus.app",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};

export const headersFileBlock = () =>
  ['/*', ...Object.entries(SECURITY_HEADERS).map(([k, v]) => `  ${k}: ${v}`)].join('\n') + '\n';
