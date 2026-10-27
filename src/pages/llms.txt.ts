// /llms.txt (llmstxt.org): a plain-Markdown map of the site for AI assistants and agents.
// Links point at each page's Markdown twin, and every page in the sitemap is listed, so
// an agent can reach the whole site from here (agentdocsspec.com: llms-txt-coverage).
import type { APIContext } from 'astro';
import { site } from '../data/site';
import { areas, AREA_IDS } from '../data/areas';
import { isThinTag } from '../data/tags';
import { faqFor } from '../lib/faq';
import { services, HOURLY_RATE_DKK } from '../data/services';
import { type Post, type Project, allTags, getPosts, getProjects, postPath } from '../lib/content';
import { markdownUrl } from '../lib/markdown-urls';
import { type Lang, localize, useT } from '../i18n/ui';

const link = (base: URL, title: string, path: string, note?: string) =>
  `- [${title}](${new URL(markdownUrl(path), base)})${note ? `: ${note}` : ''}`;

const capitalized = (s: string) => s[0].toUpperCase() + s.slice(1);

function intro(base: URL) {
  return [
    `# ${site.name}`,
    `> ${site.description.en}`,
    `${site.name} is based in ${site.location} and takes freelance and consulting work, remote or on-site. ` +
      `Hourly from ${HOURLY_RATE_DKK} DKK ex. VAT; fixed-price work is quoted after scoping; the first 30-minute call is free. ` +
      `Works in English and Danish. Contact: ${site.email} or ${new URL('/contact/', base)}.`,
    `AI agents can query the same facts over MCP (read-only, Streamable HTTP): ${new URL('/mcp', base)}. ` +
      `Docs: ${new URL('/developers/#mcp', base)}.`,
    `Every page has a Markdown version at its URL plus \`.md\` (as linked below), or via \`Accept: text/markdown\`.`,
  ].join('\n\n');
}

const PAGES = ['home', 'about', 'now', 'uses', 'cv', 'start', 'contact'] as const;

const pages = (base: URL, lang: Lang) =>
  PAGES.map((p) => link(base, capitalized(useT(lang)(`nav.${p}`)), localize(p === 'home' ? '/' : `/${p}`, lang)));

const focusAreas = (base: URL, lang: Lang) => [
  link(base, capitalized(useT(lang)('nav.what-i-do')), localize('/what-i-do', lang)),
  ...AREA_IDS.map((id) => link(base, areas[id].label[lang], localize(`/what-i-do/${id}`, lang), areas[id].intro[lang])),
];

const projectLinks = (base: URL, projects: Project[], lang: Lang) => [
  link(base, capitalized(useT(lang)('nav.projects')), localize('/projects', lang)),
  ...projects.map((p) => link(base, p.data.title, localize(`/projects/${p.id}`, lang), p.data.tagline[lang])),
];

/** The blog index, its indexed tag pages (thin ones are noindexed and left out of the sitemap too), then the posts. */
const writing = (base: URL, posts: Post[], lang: Lang) => [
  link(base, capitalized(useT(lang)('nav.blog')), localize('/blog', lang)),
  ...allTags(posts)
    .filter(([, n]) => !isThinTag(n))
    .map(([tag]) => link(base, `#${tag}`, localize(`/blog/tags/${tag}`, lang))),
  ...posts.map((p) => link(base, p.data.title, postPath(p), p.data.description)),
];

/** Danish summary, so Danish questions have quotable Danish text to land on. */
function danish(base: URL, projects: Project[], posts: Post[]) {
  return [
    site.description.da,
    `Freelance- og konsulentopgaver, remote eller on-site i Aarhus. Timepris fra ${HOURLY_RATE_DKK} kr. ekskl. moms; ` +
      'opgaver til fast pris får et tilbud efter afgrænsning; det første opkald på 30 minutter er gratis.',
    link(base, 'Ydelser og priser', '/da/services'),
    ...services.map((s) => `- **${s.title.da}**: ${s.body.da}`),
    ...pages(base, 'da'),
    ...focusAreas(base, 'da'),
    ...projectLinks(base, projects, 'da'),
    ...writing(base, posts, 'da'),
    link(base, 'Alle spørgsmål', '/da/faq'),
    ...faqFor('da').map(({ q, a }) => `- **${q}** ${a}`),
  ];
}

async function sections(base: URL) {
  const [projects, posts, daPosts] = await Promise.all([getProjects(), getPosts('en'), getPosts('da')]);
  return [
    [
      'Services',
      [link(base, 'Services & pricing', '/services'), ...services.map((s) => `- **${s.title.en}**: ${s.body.en}`)],
    ],
    ['Focus areas', focusAreas(base, 'en')],
    ['Projects', projectLinks(base, projects, 'en')],
    ['Writing', writing(base, posts, 'en')],
    ['FAQ', [link(base, 'All questions', '/faq'), ...faqFor('en').map(({ q, a }) => `- **${q}** ${a}`)]],
    ['Developers', [link(base, 'Contact API and MCP server', '/developers')]],
    ['På dansk', danish(base, projects, daPosts)],
    ['Optional', optional(base)],
  ] as const;
}

const optional = (base: URL) => [
  ...pages(base, 'en'),
  link(base, 'CV (PDF)', '/cv.pdf'),
  link(base, 'CV på dansk (PDF)', '/cv-da.pdf'),
];

export async function GET(context: APIContext) {
  const base = context.site!;
  const body = (await sections(base)).map(([h, lines]) => `## ${h}\n\n${lines.join('\n')}`);
  return new Response([intro(base), ...body].join('\n\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
