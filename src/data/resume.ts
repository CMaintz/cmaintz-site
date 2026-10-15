// CV data, single source of truth for /about and /cv (and the PDF generated
// from /cv). Sourced from MASTER_BRUTTO_CV.md; follows its conventions: no
// skill levels, provider-agnostic AI wording, early-career positioning, no
// inflated metrics (unmeasured effects phrased as intent).
import type { Lang } from '../i18n/ui';

type L = Record<Lang, string>;
type LL = Record<Lang, string[]>;

export interface Job {
  org: string;
  role: L;
  start: string;
  end?: string;
  summary: L;
  highlights: LL;
  tech?: string[];
}

export const basics = {
  name: 'Christoffer Maintz',
  label: {
    en: 'Software Developer - DevOps, Developer Experience & AI',
    da: 'Softwareudvikler - DevOps, Developer Experience & AI',
  } as L,
  summary: {
    en: 'Developer (AP Degree in Computer Science) with hands-on experience building and running production-critical systems. I work across backend, DevOps and developer tooling: CI/CD pipelines and quality gates, containerised and reproducible environments, and AI integrations with the guardrails needed to trust them. As sole developer I built a business-critical AI automation system that is still in daily use, and today I work as a consultant on DevOps, automation and AI-assisted development.',
    da: 'Datamatiker med praktisk erfaring fra udvikling og drift af produktionskritiske systemer. Jeg arbejder på tværs af backend, DevOps og udviklerværktøjer: CI/CD-pipelines og quality gates, containeriserede og reproducerbare miljøer samt AI-integrationer med de guardrails, der skal til for at kunne stole på dem. Som eneste udvikler byggede jeg et forretningskritisk AI-automatiseringssystem, der fortsat er i daglig drift, og i dag arbejder jeg som konsulent med DevOps, automatisering og AI-assisted development.',
  } as L,
};

export const work: Job[] = [
  {
    org: 'DEVEX',
    role: { en: 'Consultant - DevOps, AI & Automation', da: 'Konsulent - DevOps, AI & Automation' },
    start: '2026-07',
    summary: {
      en: 'Consulting across DevOps, backend, CI/CD, developer experience, automation and AI-assisted development, taking independent technical ownership of concrete solutions across software, infrastructure and development workflows.',
      da: 'Konsulent med bredt teknisk fokus på DevOps, backend, CI/CD, Developer Experience, automatisering og AI-assisted development. Tager selvstændigt teknisk ansvar for konkrete løsninger på tværs af software, infrastruktur og udviklingsflows.',
    },
    highlights: {
      en: [
        'CI/CD pipelines from build to test, staging and production with automated quality gates, releases and deployments across environments (incl. Azure Pipelines).',
        'Containerisation with Docker and Docker Compose; work on Kubernetes-related infrastructure; Azure (Functions, SQL), infrastructure as code, secrets management and reproducible environments.',
        'Modernising legacy applications: framework and stack upgrades (incl. legacy Shopware), removing deprecated code and consolidating duplicated logic.',
        'Developer experience: internal CLI tools, project scaffolding and reproducible local environments; linters, static analysis, tests, hooks, dependency and secret scanning moved as early in the flow as possible.',
        'AI-assisted development: coding agents with custom skills and hooks, guardrails so agent changes are never accepted uncritically, and cost-aware model routing.',
        'Mapping use cases and integrating AI into existing business processes to automate manual, repetitive work.',
      ],
      da: [
        'CI/CD-pipelines fra build til test, staging og produktion med automatiske quality gates, releases og deployments på tværs af miljøer (bl.a. Azure Pipelines).',
        'Containerisering med Docker og Docker Compose; arbejde med Kubernetes-relateret infrastruktur; Azure (Functions, SQL), Infrastructure as Code, secrets management og reproducerbare miljøer.',
        'Modernisering af legacy-applikationer: framework- og stack-opgraderinger (bl.a. legacy Shopware), fjernelse af deprecated kode og konsolidering af gentagen logik.',
        'Developer Experience: interne CLI-værktøjer, projekt-scaffolding og reproducerbare lokale miljøer; linters, static analysis, tests, hooks samt dependency- og secret-scanning flyttet så tidligt i flowet som muligt.',
        'AI-assisted development: coding agents med custom skills og hooks, guardrails så agent-ændringer aldrig accepteres ukritisk, og cost-aware model routing.',
        'Afdækning af use cases og integration af AI i eksisterende forretningsprocesser for at automatisere manuelt, repetitivt arbejde.',
      ],
    },
    tech: ['Azure Pipelines', 'Docker', 'Kubernetes', 'Azure', 'IaC', 'Shopware', 'Claude Code'],
  },
  {
    org: 'WEXO A/S',
    role: {
      en: 'Software Developer / Backend Engineer (intern)',
      da: 'Softwareudvikler / Backend Software Engineer (praktikant)',
    },
    start: '2025-08',
    end: '2026-01',
    summary: {
      en: 'Software-consultancy internship in a client context: production-ready backend services, integrations and automation for business-critical e-commerce systems, primarily the client Illux’s Shopware webshop.',
      da: 'Softwarekonsulent-praktik i kundekontekst: produktionsklare backend-services, integrationer og automatiseringsløsninger til forretningskritiske e-commerce-systemer, primært for kunden Illux’ Shopware-webshop.',
    },
    highlights: {
      en: [
        'Built Illux Product AI end to end as sole developer: a Shopware 6 plugin generating multilingual descriptions, SEO, categories and tags from product images via generative-AI APIs behind a provider-agnostic abstraction layer.',
        'Eliminated manual enrichment for most of a 3,000+ product catalogue, saving hundreds of hours of manual work. Business-critical and still in daily use.',
        'Asynchronous processing on Symfony Messenger + RabbitMQ with batching, retry with exponential backoff, idempotency, rate limiting and a full audit trail; configurable confidence model with human-in-the-loop approval.',
        'Artwork visualisation: shoppers preview art in curated rooms or a photo of their own, composited per scene and streamed live over server-sent events.',
        'Email template preview platform rendering transactional mail against real orders with client emulation, removing the need for manual test orders.',
        'Contributed cost-aware model routing to an internal agentic coding harness (Python, LangChain).',
      ],
      da: [
        'Byggede Illux Product AI end-to-end som eneste udvikler: et Shopware 6-plugin, der genererer flersprogede beskrivelser, SEO, kategorier og tags ud fra produktbilleder via generative AI-API’er bag et provider-agnostisk abstraktionslag.',
        'Eliminerede det manuelle berigelsesarbejde for størstedelen af et katalog på 3.000+ produkter og sparede hundredvis af arbejdstimer. Forretningskritisk og fortsat i daglig drift.',
        'Asynkron behandling via Symfony Messenger + RabbitMQ med batching, retry med exponential backoff, idempotens, rate limiting og fuldt audit trail; konfigurerbar confidence-model med human-in-the-loop-godkendelse.',
        'Artwork-visualisering: kunder ser kunstværket i kuraterede rum eller et foto af deres eget, kompositeret pr. scene og streamet live via Server-Sent Events.',
        'Preview-system til e-mailskabeloner, der renderer transaktionsmails mod reelle ordrer med klient-emulering og fjerner behovet for manuelle testordrer.',
        'Bidrog med cost-aware model routing til en intern agentic coding harness (Python, LangChain).',
      ],
    },
    tech: ['PHP', 'Shopware 6', 'Symfony Messenger', 'RabbitMQ', 'TypeScript', 'Vue', 'SSE', 'GitLab CI'],
  },
];

export const earlier: Job[] = [
  {
    org: 'Netto',
    role: { en: 'Sales Lead (acting assistant store manager)', da: 'Salgsleder (reelt souschefansvar)' },
    start: '2017-05',
    end: '2023-10',
    summary: {
      en: 'Ran daily operations across day and evening shifts: staffing, delegation, employee development and process improvement. Led a waste-reduction initiative worth roughly DKK 1M to the bottom line in its first year.',
      da: 'Ledelse af daglig drift på tværs af dag- og aftenhold: bemanding, uddelegering, medarbejderudvikling og procesforbedring. Ledte et spildreduktionsinitiativ, der gav ca. 1 mio. kr. på bundlinjen det første år.',
    },
    highlights: { en: [], da: [] },
  },
  {
    org: 'Kiwi',
    role: { en: 'Assistant Store Manager', da: 'Souschef' },
    start: '2015-10',
    end: '2017-05',
    summary: {
      en: 'Shared responsibility for daily operations, planning and staff coordination; onboarding and interviews.',
      da: 'Medansvar for daglig drift, planlægning og koordinering af medarbejdere; onboarding og jobsamtaler.',
    },
    highlights: { en: [], da: [] },
  },
];

export const education = [
  {
    institution: 'Erhvervsakademi Aarhus (Business Academy Aarhus)',
    degree: {
      en: 'AP Degree in Computer Science (Datamatiker)',
      da: 'Datamatiker (AP Degree in Computer Science)',
    } as L,
    start: '2023-08',
    end: '2026-01',
    note: { en: 'Electives: Advanced Databases, iOS', da: 'Valgfag: Avancerede Databaser, iOS' } as L,
  },
  {
    institution: 'Aarhus HF & VUC',
    degree: { en: 'Higher Preparatory Examination (HF)', da: 'HF (Højere Forberedelseseksamen)' } as L,
    start: '2021-08',
    end: '2023-06',
  },
];

export const courses = [
  {
    name: {
      en: 'Leadership, Communication & Employee Development',
      da: 'Ledelse, Kommunikation & Medarbejderudvikling',
    } as L,
    org: 'Niels Holte Kurser',
    year: '2018',
  },
  { name: { en: 'Conflict Management', da: 'Konflikthåndtering' } as L, org: 'Butikskontrol Syd', year: '2017' },
];

export const skills: { name: L; keywords: string[] }[] = [
  {
    name: { en: 'DevOps & CI/CD', da: 'DevOps & CI/CD' },
    keywords: [
      'GitHub Actions',
      'GitLab CI',
      'Azure Pipelines',
      'Docker / Compose',
      'Kubernetes',
      'mise',
      'Quality gates & ratcheting',
      'Pre-commit / pre-push hooks',
      'IaC / Config- / Policy-as-code',
      'Secrets management',
    ],
  },
  {
    name: { en: 'Developer Experience', da: 'Developer Experience' },
    keywords: [
      'Internal CLI tools',
      'Project scaffolding',
      'Reproducible local environments',
      'PR automation',
      'Static analysis',
      'Semgrep',
      'gitleaks',
      'osv-scanner',
      'ESLint',
      'Renovate',
    ],
  },
  {
    name: { en: 'AI & automation', da: 'AI & automatisering' },
    keywords: [
      'LLM / generative-AI integration',
      'Schema-enforced structured output',
      'Prompt engineering',
      'Evaluation harnesses',
      'RAG · embeddings · pgvector',
      'Agentic coding (Claude Code skills & hooks)',
      'Guardrails & confidence gating',
      'Cost-aware model routing',
      'MCP',
      'LangChain',
      'n8n',
    ],
  },
  {
    name: { en: 'Backend', da: 'Backend' },
    keywords: [
      'ASP.NET Core & MVC',
      'Spring Boot',
      'Quarkus',
      'Symfony / Shopware 6',
      'Node.js / Express',
      'REST APIs',
      'RabbitMQ',
      'Symfony Messenger',
    ],
  },
  {
    name: { en: 'Frontend & apps', da: 'Frontend & apps' },
    keywords: ['Angular', 'React', 'Vue', 'Astro', 'SwiftUI', 'WPF', 'JavaFX'],
  },
  {
    name: { en: 'Cloud & data', da: 'Cloud & data' },
    keywords: [
      'Azure (Functions, SQL)',
      'Cloudflare',
      'Serverless',
      'PostgreSQL',
      'MS SQL / T-SQL',
      'MySQL',
      'Oracle / PL-SQL',
      'Redis',
      'Firebase',
      'Supabase',
      'Flyway',
    ],
  },
  {
    name: { en: 'Languages', da: 'Programmeringssprog' },
    keywords: ['C# / .NET', 'Java', 'PHP', 'TypeScript', 'JavaScript', 'Python', 'Kotlin', 'Swift', 'SQL', 'Shell'],
  },
  {
    name: { en: 'Architecture & craft', da: 'Arkitektur & håndværk' },
    keywords: [
      'Hexagonal / clean architecture',
      'Event-driven architecture',
      'Modular monolith',
      'Domain modelling',
      'SOLID & GRASP',
      'TDD',
      'Code review',
      'Scrum',
      'Legacy modernisation',
    ],
  },
];

export const languages = [
  { language: { en: 'Danish', da: 'Dansk' } as L, fluency: { en: 'Native', da: 'Modersmål' } as L },
  { language: { en: 'English', da: 'Engelsk' } as L, fluency: { en: 'Fluent', da: 'Flydende' } as L },
];
