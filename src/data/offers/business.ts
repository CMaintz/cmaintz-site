import type { Service } from '../services';

/** Services for business owners and managers: no technical background needed. */
export const businessServices: Service[] = [
  {
    id: 'automation',
    audience: 'business',
    areas: ['backend', 'ai'],
    glyph: '⟳',
    title: { en: 'Workflow automation & integrations', da: 'Automatisering & integrationer' },
    body: {
      en: 'The copy-paste between webshop, accounting, spreadsheets and email - done by the systems instead of by people. I find the tasks that eat your week and connect the tools you already have, in code or with low-code tools like Power Automate, Make or n8n when that suits you better.',
      da: 'Copy-paste mellem webshop, regnskab, regneark og mail - klaret af systemerne i stedet for af medarbejderne. Jeg finder de opgaver, der æder jeres uge, og forbinder de værktøjer, I allerede har, med kode eller med low-code som Power Automate, Make eller n8n, når det passer jer bedre.',
    },
    deliverables: {
      en: [
        'Map of manual tasks & time spent',
        'Integrations between your systems',
        'Error alerts instead of silent failures',
        'Plain-language hand-over',
      ],
      da: [
        'Overblik over manuelle opgaver og tidsforbrug',
        'Integrationer mellem jeres systemer',
        'Fejlbeskeder i stedet for stille fejl',
        'Overdragelse i almindeligt sprog',
      ],
    },
    pricing: 'either',
  },
  {
    id: 'ai-tasks',
    audience: 'business',
    areas: ['ai', 'backend'],
    glyph: '✧',
    title: { en: 'AI that takes over a task', da: 'AI, der overtager en opgave' },
    body: {
      en: 'Product texts, sorting incoming mail, reading invoices and orders into e-conomic, Dinero or your ERP: AI does the routine work, and a person checks only the cases it is unsure of. Tested on your own data before you commit.',
      da: 'Produkttekster, sortering af indgående mails, fakturaer og ordrer læst ind i e-conomic, Dinero eller jeres ERP: AI klarer rutinearbejdet, og et menneske tjekker kun de sager, den er usikker på. Testet på jeres egne data, før I binder jer.',
    },
    deliverables: {
      en: [
        'Test on your own data first',
        'Human review of uncertain cases',
        'Running costs known up front',
        'Any major AI provider, swappable',
      ],
      da: [
        'Test på jeres egne data først',
        'Menneskelig kontrol af usikre sager',
        'Kendte driftsomkostninger',
        'Enhver større AI-udbyder, kan udskiftes',
      ],
    },
    pricing: 'quote',
  },
  {
    id: 'ai-assistant',
    audience: 'business',
    areas: ['ai', 'backend'],
    glyph: '◐',
    title: { en: 'AI assistant on your own knowledge', da: 'AI-assistent på jeres egen viden' },
    body: {
      en: 'An assistant that answers from your own documents, FAQ and product data: draft replies to customer mail for a person to approve, a chat on your website, or search across SharePoint and Drive that shows its sources.',
      da: 'En assistent, der svarer ud fra jeres egne dokumenter, FAQ og produktdata: udkast til svar på kundemails, som et menneske godkender, en chat på hjemmesiden eller søgning på tværs af SharePoint og Drive, der viser sine kilder.',
    },
    deliverables: {
      en: [
        'Answers with sources',
        'Human approval where it matters',
        'Measured answer quality',
        'Data stays where you decide',
      ],
      da: [
        'Svar med kildehenvisning',
        'Menneskelig godkendelse, hvor det tæller',
        'Målt svarkvalitet',
        'Data bliver, hvor I bestemmer',
      ],
    },
    pricing: 'quote',
  },
  {
    id: 'ai-training',
    audience: 'business',
    areas: ['ai'],
    glyph: '◒',
    title: { en: 'AI workshop for your staff', da: 'AI-workshop for medarbejdere' },
    body: {
      en: 'Hands-on use of ChatGPT, Microsoft Copilot and similar tools on your team’s real tasks, plus simple rules for what data may go where. Your staff leave with workflows they use the next morning.',
      da: 'Praktisk brug af ChatGPT, Microsoft Copilot og lignende værktøjer på jeres egne opgaver, plus enkle regler for, hvilke data der må hvorhen. Medarbejderne går derfra med arbejdsgange, de bruger næste morgen.',
    },
    deliverables: {
      en: [
        'Workshop on-site or online',
        'Exercises on your own tasks',
        'One-page AI usage policy',
        'Prompt library for your team',
      ],
      da: [
        'Workshop hos jer eller online',
        'Øvelser på jeres egne opgaver',
        'AI-retningslinjer på én side',
        'Promptbibliotek til teamet',
      ],
    },
    pricing: 'quote',
  },
  {
    id: 'webshop',
    audience: 'business',
    areas: ['backend'],
    glyph: '🛒',
    title: { en: 'Webshops & e-commerce integrations', da: 'Webshops & e-handelsintegrationer' },
    body: {
      en: 'Features, fixes and integrations for your webshop: Shopware 6 is my speciality, and I also work with Shopify and WooCommerce. Connect the shop to your ERP, accounting, shipping or product data, or get a custom plugin built to last.',
      da: 'Funktioner, rettelser og integrationer til jeres webshop: Shopware 6 er mit speciale, og jeg arbejder også med Shopify og WooCommerce. Forbind shoppen med ERP, regnskab, fragt eller produktdata, eller få bygget et plugin, der holder.',
    },
    deliverables: {
      en: ['Custom plugins & apps', 'ERP, shipping & accounting integrations', 'Tests', 'Deployment guide'],
      da: ['Skræddersyede plugins & apps', 'Integration til ERP, fragt & regnskab', 'Tests', 'Deployment-guide'],
    },
    pricing: 'either',
  },
  {
    id: 'fullstack',
    audience: 'business',
    areas: ['backend'],
    glyph: '▦',
    title: { en: 'Full-stack web apps', da: 'Full-stack webapps' },
    body: {
      en: 'From MVP to maintainable product: Spring Boot, .NET or Node backends with clean architecture; Angular, React, Vue or Astro frontends; Postgres with full-text and vector search.',
      da: 'Fra MVP til vedligeholdbart produkt: Spring Boot-, .NET- eller Node-backends med ren arkitektur; Angular-, React-, Vue- eller Astro-frontends; Postgres med fuldtekst- og vektorsøgning.',
    },
    deliverables: {
      en: ['Architecture & data model', 'API + frontend', 'CI/CD from day one', 'Docker-based deploy'],
      da: ['Arkitektur & datamodel', 'API + frontend', 'CI/CD fra dag ét', 'Docker-baseret deploy'],
    },
    pricing: 'either',
  },
  {
    id: 'mobile',
    audience: 'business',
    areas: [],
    glyph: '▯',
    title: { en: 'Mobile apps', da: 'Mobilapps' },
    body: {
      en: 'Native iOS and Android apps in Swift and Kotlin, with the backend and API behind them, for your customers or your own staff in the field.',
      da: 'Native iOS- og Android-apps i Swift og Kotlin, med backend og API bag dem, til jeres kunder eller jeres egne medarbejdere ude i marken.',
    },
    deliverables: {
      en: ['iOS & Android apps', 'Backend & API', 'App Store & Google Play release'],
      da: ['iOS- & Android-apps', 'Backend & API', 'Udgivelse i App Store & Google Play'],
    },
    pricing: 'either',
  },
];
