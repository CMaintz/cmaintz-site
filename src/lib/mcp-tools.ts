// The tools behind /mcp (src/lib/mcp.ts). All read-only, and all read the same
// data modules the site renders, so an agent's answer can't drift from the pages.
import type { McpTool } from './mcp';
import { site } from '../data/site';
import { services, process, workLanguages, HOURLY_RATE_DKK } from '../data/services';
import { faq } from '../data/faq';
import { areas, AREA_IDS } from '../data/areas';
import { type Lang, localize, withSlash } from '../i18n/ui';

type L = Record<Lang, string>;

/** What the route loads from the content collections, only for tools/call. */
export interface McpCatalog {
  base: URL;
  projects: {
    id: string;
    title: string;
    tagline: L;
    summary: L;
    areas: string[];
    stack: string[];
    featured: boolean;
  }[];
  posts: { id: string; title: string; description: string; pubDate: Date; tags: string[] }[];
}

const langSchema = { type: 'string', enum: ['en', 'da'], default: 'en', description: 'Answer language' };
const withLang = { type: 'object', properties: { lang: langSchema }, additionalProperties: false };
const langOf = (args: Record<string, unknown>): Lang => (args.lang === 'da' ? 'da' : 'en');
const url = (base: URL, path: string, lang: Lang = 'en') => new URL(localize(path, lang), base).toString();

function profile(_: Record<string, unknown>, { base }: McpCatalog) {
  return {
    name: site.name,
    role: site.role.en,
    summary: site.description.en,
    location: site.location,
    timezone: site.timezone,
    languages: ['English', 'Danish'],
    availableForFreelance: site.available,
    workModes: ['remote', 'on-site in Aarhus'],
    rate: { hourly: HOURLY_RATE_DKK, currency: 'DKK', vatIncluded: false, fixedPrice: 'quoted after scoping' },
    firstCallFree: '30 minutes',
    contact: { page: url(base, '/contact'), email: site.email },
    links: { website: base.toString(), github: site.socials.github, linkedin: site.socials.linkedin },
  };
}

function serviceList(args: Record<string, unknown>, { base }: McpCatalog) {
  const lang = langOf(args);
  return {
    services: services.map((s) => ({
      id: s.id,
      title: s.title[lang],
      description: s.body[lang],
      deliverables: s.deliverables[lang],
      pricing: s.pricing === 'quote' ? 'quoted after scoping' : s.pricing === 'hourly' ? 'hourly' : 'hourly or quoted',
      areas: s.areas,
    })),
    hourlyRateDKK: HOURLY_RATE_DKK,
    process: process[lang],
    languagesWorkedIn: workLanguages,
    page: url(base, '/services', lang),
  };
}

const faqList = (args: Record<string, unknown>, { base }: McpCatalog) => {
  const lang = langOf(args);
  return { faq: faq[lang].map(({ q, a }) => ({ question: q, answer: a })), page: url(base, '/services', lang) };
};

function projectList(args: Record<string, unknown>, { base, projects }: McpCatalog) {
  const area = typeof args.area === 'string' ? args.area : undefined;
  const lang = langOf(args);
  return {
    projects: projects
      .filter((p) => !area || p.areas.includes(area))
      .map((p) => ({
        title: p.title,
        tagline: p.tagline[lang],
        summary: p.summary[lang],
        areas: p.areas,
        stack: p.stack,
        featured: p.featured,
        url: url(base, `/projects/${p.id}`, lang),
      })),
  };
}

const postList = (_: Record<string, unknown>, { base, posts }: McpCatalog) => ({
  posts: posts.map((p) => ({
    title: p.title,
    description: p.description,
    published: p.pubDate.toISOString().slice(0, 10),
    tags: p.tags,
    url: new URL(withSlash(`/blog/${p.id}`), base).toString(),
  })),
});

const areaSchema = {
  type: 'object',
  properties: {
    area: {
      type: 'string',
      enum: [...AREA_IDS],
      description: Object.entries(areas)
        .map(([id, a]) => `${id}: ${a.label.en}`)
        .join('; '),
    },
    lang: langSchema,
  },
  additionalProperties: false,
};

export const mcpTools: McpTool<McpCatalog>[] = [
  {
    name: 'get_profile',
    title: 'Profile and availability',
    description: `Who ${site.name} is, where he works, whether he is available for freelance work, his hourly rate and how to contact him.`,
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: profile,
  },
  {
    name: 'list_services',
    title: 'Services and pricing',
    description:
      'Freelance services (AI automation, AI-assisted development, CI/CD and DX, full-stack, Shopware), how each is priced, and how an engagement runs.',
    inputSchema: withLang,
    run: serviceList,
  },
  {
    name: 'get_faq',
    title: 'Frequently asked questions',
    description:
      'Common questions from prospective clients: what kind of AI automation, which models, cost, remote work, getting started.',
    inputSchema: withLang,
    run: faqList,
  },
  {
    name: 'list_projects',
    title: 'Projects and case studies',
    description: 'Portfolio projects with summaries, tech stack and links, optionally filtered by focus area.',
    inputSchema: areaSchema,
    run: projectList,
  },
  {
    name: 'list_posts',
    title: 'Blog posts',
    description: 'Articles and case studies, newest first.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: postList,
  },
];
