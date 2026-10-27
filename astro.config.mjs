// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import mermaid from 'astro-mermaid';
import { unified } from '@astrojs/markdown-remark';

import { appendFile } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { headersFileBlock } from './src/lib/security-headers.ts';
import { linkHeadersBlock } from './src/lib/api-catalog.ts';
import { writeMarkdownPages } from './src/lib/markdown-pages.ts';
import { pageDates, lastmodFor } from './src/lib/lastmod.ts';
import { rehypeCanonicalLinks } from './src/lib/rehype-canonical-links.ts';
import { thinTagPaths } from './src/lib/thin-tags.ts';
import { fileURLToPath } from 'node:url';

// Build-time: canonical URLs, RSS, sitemap and OG tags. Read from the shell/CI env
// or .env; set it to the workers.dev URL after the first deploy, then the domain.
const fileEnv = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
// `||`, not `??`: an unset GitHub variable reaches the build as an empty string.
const SITE = process.env.SITE_URL || fileEnv.SITE_URL || 'https://maintz.dev';
// When each page last changed (git + post front matter): sitemap <lastmod> and JSON-LD dateModified.
const PAGE_DATES = pageDates();
// Tag pages with too few posts are noindexed (BlogIndexView), so the sitemap leaves them out too.
const THIN_TAGS = thinTagPaths('src/content/blog');

/**
 * Appends the site-wide security headers, and the homepage's discovery Link header,
 * to the `_headers` file Cloudflare serves static assets with.
 * @type {import('astro').AstroIntegration}
 */
const securityHeaders = {
  name: 'security-headers',
  hooks: {
    'astro:build:done': async ({ dir }) =>
      appendFile(
        new URL('_headers', dir),
        `
${headersFileBlock()}
${linkHeadersBlock()}`,
      ),
  },
};

/**
 * Writes a Markdown twin of every page for `Accept: text/markdown` requests (see src/worker.ts).
 * @type {import('astro').AstroIntegration}
 */
const markdownPages = {
  name: 'markdown-pages',
  hooks: {
    'astro:build:done': async ({ dir, logger }) =>
      logger.info(`${await writeMarkdownPages(fileURLToPath(dir), SITE)} Markdown pages written`),
  },
};

/**
 * Dev only: the Cloudflare Vite plugin hands every request matching `run_worker_first` to the
 * Worker before Vite can serve its own modules, so island scripts 404 and nothing hydrates
 * (cloudflare/workers-sdk#14626). Moves that middleware to just after Vite's transform step.
 * If the internal names change it does nothing.
 * @type {import('vite').Plugin}
 */
const viteModulesBeforeWorker = {
  name: 'vite-modules-before-worker',
  apply: 'serve',
  configureServer(server) {
    return () => {
      const stack = server.middlewares.stack;
      /** @param {string} name */
      const named = (name) => stack.findIndex((m) => /** @type {Function} */ (m.handle).name === name);
      const i = named('cloudflarePreMiddleware');
      if (i === -1) return;
      const [pre] = stack.splice(i, 1);
      stack.splice(named('viteTransformMiddleware') + 1, 0, pre);
    };
  },
};

export default defineConfig({
  site: SITE,
  adapter: cloudflare({
    imageService: 'passthrough',
    // Prerendering never calls the AI binding, and its remote connection needs a
    // Cloudflare login that CI builds don't have. Dev keeps it, to test the assistant.
    remoteBindings: !process.argv.includes('build'),
  }),
  trailingSlash: 'ignore',
  // No server sessions needed; avoids provisioning a KV namespace on Cloudflare.
  session: false,
  redirects: {
    // Friendlier address for the blog editor; Keystatic itself always lives at /keystatic.
    '/editor': '/keystatic',
    // Old addresses of Danish posts, which live under /da/blog/.
    '/blog/fem-opgaver-du-kan-automatisere': '/da/blog/fem-opgaver-du-kan-automatisere',
    '/blog/ai-i-webshoppen-fra-demo-til-drift': '/da/blog/ai-i-webshoppen-fra-demo-til-drift',
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
    // Blog editor at /keystatic (keystatic.config.ts). React only loads on that page.
    react(),
    keystatic(),
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', da: 'da' } },
      filter: (page) => !THIN_TAGS.has(new URL(page).pathname),
      serialize: (item) => ({ ...item, lastmod: lastmodFor(PAGE_DATES, item.url) }),
    }),
  ],
  vite: {
    plugins: [viteModulesBeforeWorker],
    define: { 'import.meta.env.PAGE_DATES': JSON.stringify(PAGE_DATES) },
    // Keystatic's API route is injected from node_modules, so the dev scanner never finds it and
    // its CommonJS deps reach the Worker unbundled ("exports is not defined").
    optimizeDeps: { include: ['@keystatic/core/api/generic', '@keystatic/core', '@keystatic/core/content-components'] },
  },
  markdown: {
    processor: unified({ rehypePlugins: [rehypeCanonicalLinks] }),
  },
  env: {
    schema: {
      // Contact form - see SETUP.md. All optional so the site builds without them.
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'public', default: 'cmaintz@outlook.com' }),
      CONTACT_FROM_EMAIL: envField.string({
        context: 'server',
        access: 'public',
        default: 'maintz.dev contact form <onboarding@resend.dev>',
      }),
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
      // Blog editor (Keystatic GitHub mode) - see SETUP.md. Optional: without them /keystatic can't sign in.
      KEYSTATIC_GITHUB_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      KEYSTATIC_GITHUB_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      KEYSTATIC_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: envField.string({ context: 'client', access: 'public', optional: true }),
      // Site assistant (Buddy) - see SETUP.md. The widget only renders when PUBLIC_ASSISTANT is "on".
      // Which model answers (src/data/assistant.ts): workers-ai (default, no key), anthropic or openai-compatible.
      // "secret" only so they are read at runtime: a Worker variable can switch models without a rebuild.
      ASSISTANT_PROVIDER: envField.string({ context: 'server', access: 'secret', optional: true }),
      ASSISTANT_MODEL: envField.string({ context: 'server', access: 'secret', optional: true }),
      ASSISTANT_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      // The provider's API, or a Cloudflare AI Gateway endpoint in front of it for a spend limit.
      ASSISTANT_BASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      // A string, not an enum: an unset GitHub variable reaches the build as "", which an enum rejects.
      PUBLIC_ASSISTANT: envField.string({ context: 'client', access: 'public', optional: true }),
      // Cloudflare Web Analytics beacon token - omitted when unset.
      PUBLIC_CF_BEACON_TOKEN: envField.string({ context: 'client', access: 'public', optional: true }),
      // Umami Cloud website id (visit paths, entry pages) - omitted when unset.
      PUBLIC_UMAMI_WEBSITE_ID: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
});
