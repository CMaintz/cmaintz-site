// /llms.txt (llmstxt.org): a plain-Markdown map of the site for AI assistants and agents.
import type { APIContext } from 'astro';
import { site } from '../data/site';
import { areas, AREA_IDS } from '../data/areas';
import { faq } from '../data/faq';
import { services, HOURLY_RATE_DKK } from '../data/services';
import { getPosts, getProjects } from '../lib/content';
import { withSlash } from '../i18n/ui';

const link = (base: URL, title: string, path: string, note?: string) =>
  `- [${title}](${new URL(withSlash(path), base)})${note ? `: ${note}` : ''}`;

function intro(base: URL) {
  return [
    `# ${site.name}`,
    `> ${site.description.en}`,
    `${site.name} is based in ${site.location} and takes freelance and consulting work, remote or on-site. ` +
      `Hourly from ${HOURLY_RATE_DKK} DKK ex. VAT; fixed-price work is quoted after scoping; the first 30-minute call is free. ` +
      `Works in English and Danish. Contact: ${site.email} or ${new URL('/contact/', base)}.`,
  ].join('\n\n');
}

/** Danish summary, so Danish questions have quotable Danish text to land on. */
function danish(base: URL) {
  return [
    site.description.da,
    `Freelance- og konsulentopgaver, remote eller on-site i Aarhus. Timepris fra ${HOURLY_RATE_DKK} kr. ekskl. moms; ` +
      'opgaver til fast pris får et tilbud efter afgrænsning; det første opkald på 30 minutter er gratis.',
    link(base, 'Ydelser og priser', '/da/services'),
    link(base, 'Kontakt', '/da/contact'),
    ...services.map((s) => `- **${s.title.da}**: ${s.body.da}`),
    ...faq.da.map(({ q, a }) => `- **${q}** ${a}`),
  ];
}

async function sections(base: URL) {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  return [
    [
      'Services',
      [link(base, 'Services & pricing', '/services'), ...services.map((s) => `- **${s.title.en}**: ${s.body.en}`)],
    ],
    ['Focus areas', AREA_IDS.map((id) => link(base, areas[id].label.en, `/what-i-do/${id}`, areas[id].intro.en))],
    ['Projects', projects.map((p) => link(base, p.data.title, `/projects/${p.id}`, p.data.tagline.en))],
    ['Writing', posts.map((p) => link(base, p.data.title, `/blog/${p.id}`, p.data.description))],
    ['FAQ', faq.en.map(({ q, a }) => `- **${q}** ${a}`)],
    ['På dansk', danish(base)],
    [
      'Optional',
      [link(base, 'About', '/about'), link(base, 'CV (PDF)', '/cv.pdf'), link(base, 'CV på dansk (PDF)', '/cv-da.pdf')],
    ],
  ] as const;
}

export async function GET(context: APIContext) {
  const base = context.site!;
  const body = (await sections(base)).map(([h, lines]) => `## ${h}\n\n${lines.join('\n')}`);
  return new Response([intro(base), ...body].join('\n\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
