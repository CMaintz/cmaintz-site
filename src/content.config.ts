import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localized = z.object({ en: z.string(), da: z.string() });

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      lang: z.enum(['en', 'da']).default('en'),
      draft: z.boolean().default(false),
      cover: image().optional(),
      comments: z.boolean().default(true),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: localized,
    summary: localized,
    category: z.enum(['professional', 'open-source', 'personal', 'academic']),
    /** Lower sorts first within the featured strip / list. */
    order: z.number().default(100),
    featured: z.boolean().default(false),
    role: z.string(),
    context: z.string(),
    start: z.string(),
    end: z.string().optional(),
    /** Dates marked approximate in PORTFOLIO.md - confirm before relying on them. */
    dateApprox: z.boolean().default(false),
    grade: z.string().optional(),
    stack: z.array(z.string()),
    /** GitHub repo name(s) under CMaintz; first is primary. */
    repos: z.array(z.string()).default([]),
    /** Iframe-able live demo URL. */
    demo: z.url().optional(),
    live: z.url().optional(),
    /** Looping clip base path, e.g. /media/illux-visualiser (see scripts/encode-clip.mjs). */
    video: z.string().optional(),
    metrics: z.array(z.object({ value: z.string(), label: localized })).default([]),
    glyph: z.string().default('▣'),
  }),
});

export const collections = { blog, projects };
