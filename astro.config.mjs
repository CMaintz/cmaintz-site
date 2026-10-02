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

import { loadEnv } from 'vite';

// Build-time: canonical URLs, RSS, sitemap and OG tags. Read from the shell/CI env
// or .env; set it to the workers.dev URL after the first deploy, then the domain.
const fileEnv = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const SITE = process.env.SITE_URL ?? fileEnv.SITE_URL ?? 'https://maintz.dev';

export default defineConfig({
  site: SITE,
  adapter: cloudflare({ imageService: 'passthrough' }),
  trailingSlash: 'ignore',
  // No server sessions needed; avoids provisioning a KV namespace on Cloudflare.
  session: false,
  redirects: {
    '/projects/reel-scout': '/projects/movie-db',
    '/da/projects/reel-scout': '/da/projects/movie-db',
  },
  i18n: {
    locales: ['en', 'da'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
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
    }),
  ],
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
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
