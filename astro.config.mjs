// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import mermaid from 'astro-mermaid';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';

import { appendFile } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { headersFileBlock } from './src/lib/security-headers.ts';
import { linkHeadersBlock } from './src/lib/api-catalog.ts';
import { writeMarkdownPages } from './src/lib/markdown-pages.ts';
import { pageDates, lastmodFor } from './src/lib/lastmod.ts';
import { rehypeCanonicalLinks } from './src/lib/rehype-canonical-links.ts';
import { fileURLToPath } from 'node:url';

// Build-time: canonical URLs, RSS, sitemap and OG tags. Read from the shell/CI env
// or .env; set it to the workers.dev URL after the first deploy, then the domain.
const fileEnv = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
// `||`, not `??`: an unset GitHub variable reaches the build as an empty string.
const SITE = process.env.SITE_URL || fileEnv.SITE_URL || 'https://maintz.dev';
// When each page last changed (git + post front matter): sitemap <lastmod> and JSON-LD dateModified.
const PAGE_DATES = pageDates();

/**
 * Appends the site-wide security headers, and the homepage's discovery Link header,
 * to the `_headers` file Cloudflare serves static assets with.
 * @type {import('astro').AstroIntegration}
 */
const securityHeaders = {
  name: 'security-headers',
  hooks: {
    'astro:build:done': async ({ dir }) => appendFile(new URL('_headers', dir), `
${headersFileBlock()}
${linkHeadersBlock()}`),
  },
};

/**
 * Writes a Markdown twin of every page for `Accept: text/markdown` requests (see src/worker.ts).
 * @type {import('astro').AstroIntegration}
 */
const markdownPages = {
  name: 'markdown-pages',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => logger.info(`${await writeMarkdownPages(fileURLToPath(dir), SITE)} Markdown pages written`),
  },
};

export default defineConfig({
  site: SITE,
  adapter: cloudflare({ imageService: 'passthrough' }),
  trailingSlash: 'ignore',
  // No server sessions needed; avoids provisioning a KV namespace on Cloudflare.
  session: false,
  redirects: {
    '/projects/reel-scout': '/projects/movie-explorer',
    '/da/projects/reel-scout': '/da/projects/movie-explorer',
    '/projects/movie-db': '/projects/movie-explorer',
    '/da/projects/movie-db': '/da/projects/movie-explorer',
    '/projects/jev-guard': '/projects/jev-tools',
    '/da/projects/jev-guard': '/da/projects/jev-tools',
    '/projects/jev-sort': '/projects/jev-tools',
    '/da/projects/jev-sort': '/da/projects/jev-tools',
    '/projects/jev-triage': '/projects/jev-tools',
    '/da/projects/jev-triage': '/da/projects/jev-tools',
  },
  i18n: {
    locales: ['en', 'da'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    securityHeaders,
    markdownPages,
    mermaid({ theme: 'dark', autoTheme: true }),
    expressiveCode({
      themes: ['github-dark-dimmed', 'github-light'],
      themeCssSelector: (theme) => (theme.type === 'dark' ? '[data-theme="dark"]' : '[data-theme="light"]'),
      useDarkModeMediaQuery: false,
      styleOverrides: {
        borderRadius: '0',
        borderColor: 'var(--line)',
        codeFontFamily: "'JetBrains Mono', ui-monospace, monospace",
        uiFontFamily: "'JetBrains Mono', ui-monospace, monospace",
        frames: { shadowColor: 'transparent' },
      },
    }),
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', da: 'da' } },
      serialize: (item) => ({ ...item, lastmod: lastmodFor(PAGE_DATES, item.url) }),
    }),
  ],
  vite: { define: { __PAGE_DATES__: JSON.stringify(PAGE_DATES) } },
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex, rehypeCanonicalLinks] }),
  },
  env: {
    schema: {
      // Contact form - see SETUP.md. All optional so the site builds without them.
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'public', default: 'cmaintz@outlook.com' }),
      CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'public', default: 'maintz.dev contact form <onboarding@resend.dev>' }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      // Comments (Supabase, preferred) - see SETUP.md. Public by design (RLS protects data).
      PUBLIC_SUPABASE_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_SUPABASE_ANON_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_SUPABASE_PROVIDERS: envField.string({ context: 'client', access: 'public', default: 'github' }),
      // Comments (giscus fallback) - see SETUP.md.
      PUBLIC_GISCUS_REPO: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GISCUS_REPO_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GISCUS_CATEGORY: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GISCUS_CATEGORY_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      // Cloudflare Web Analytics beacon token - omitted when unset.
      PUBLIC_CF_BEACON_TOKEN: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
});
