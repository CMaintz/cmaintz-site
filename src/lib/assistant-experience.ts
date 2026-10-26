// "Have you worked with X?" for the site assistant: an exact lookup over the
// facts the site already publishes, so a yes always comes with a page to cite.
// Vector search would answer "Java" with JavaScript projects; this doesn't.
import { work, earlier, skills } from '../data/resume';
import { services, workLanguages } from '../data/services';
import type { McpCatalog } from './mcp-tools';
import { localize } from '../i18n/ui';

export interface Fact {
  kind: 'project' | 'job' | 'skill' | 'service' | 'post';
  title: string;
  text: string;
  path: string;
}

const MAX_TERMS = 6;
const MAX_EVIDENCE = 4;
const SNIPPET = 220;

function resumeFacts(): Fact[] {
  const jobs = [...work, ...earlier].map((j): Fact => ({
    kind: 'job',
    title: `${j.role.en}, ${j.org}`,
    text: [j.summary.en, ...j.highlights.en, ...(j.tech ?? [])].join(' '),
    path: '/about/',
  }));
  const skillFacts = skills.map((s): Fact => ({
    kind: 'skill',
    title: s.name.en,
    text: s.keywords.join(', '),
    path: '/cv/',
  }));
  const langs: Fact = { kind: 'skill', title: 'Languages', text: workLanguages.join(', '), path: '/services/' };
  return [...jobs, ...skillFacts, langs];
}

const projectFacts = (catalog: Pick<McpCatalog, 'projects'>) =>
  catalog.projects.map((p): Fact => ({
    kind: 'project',
    title: p.title,
    text: [p.stack.join(', '), p.tagline.en, p.summary.en].join(' '),
    path: `/projects/${p.id}/`,
  }));

/** Everything the lookup searches, built from the same data the pages render. */
export function experienceFacts(catalog: Pick<McpCatalog, 'projects' | 'posts'>): Fact[] {
  const offered = services.map((s): Fact => ({
    kind: 'service',
    title: s.title.en,
    text: [s.body.en, ...s.deliverables.en].join(' '),
    path: '/services/',
  }));
  const posts = catalog.posts.map((p): Fact => ({
    kind: 'post',
    title: p.title,
    text: [p.description, ...p.tags].join(' '),
    path: localize(`/blog/${p.id}`, p.lang),
  }));
  return [...projectFacts(catalog), ...resumeFacts(), ...offered, ...posts];
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whole-name match: "Java" must not hit "JavaScript", nor "C" hit "C#". */
const termPattern = (term: string) => new RegExp(`(?<![\\w#+.])${escape(term)}(?![\\w#+])`, 'i');

function snippet(text: string, re: RegExp) {
  const at = text.search(re);
  const start = Math.max(0, at - SNIPPET / 2);
  return (start > 0 ? '...' : '') + text.slice(start, start + SNIPPET).trim();
}

/** Projects and jobs are work he did; skills, services and posts only show he lists, offers or writes about it. */
const SHIPPED: Fact['kind'][] = ['project', 'job'];

function lookup(term: string, facts: Fact[]) {
  const re = termPattern(term);
  const hits = facts.filter((f) => re.test(`${f.title} ${f.text}`)).slice(0, MAX_EVIDENCE);
  return {
    term,
    found: hits.length > 0,
    shipped: hits.some((f) => SHIPPED.includes(f.kind)),
    evidence: hits.map((f) => ({ kind: f.kind, title: f.title, path: f.path, excerpt: snippet(f.text, re) })),
  };
}

export function findExperience(args: Record<string, unknown>, facts: Fact[]) {
  const terms = Array.isArray(args.terms) ? args.terms.filter((t): t is string => typeof t === 'string') : [];
  const clean = terms
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, MAX_TERMS);
  return { results: clean.map((t) => lookup(t, facts)) };
}
