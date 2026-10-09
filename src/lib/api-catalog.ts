// Machine-readable description of the site's one public API (the contact form),
// shared by /openapi.json, /developers, /.well-known/api-catalog (RFC 9727)
// and the homepage Link header (RFC 8288).
import { site } from '../data/site';

export const API_PATHS = {
  catalog: '/.well-known/api-catalog',
  spec: '/openapi.json',
  docs: '/developers/',
  health: '/api/health',
  contact: '/api/contact',
  llms: '/llms.txt',
} as const;

export const LINKSET_TYPE = 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';

/** RFC 9727 linkset: one entry per API, anchored at its base URL. */
export function apiCatalog(base: URL) {
  const abs = (path: string) => new URL(path, base).toString();
  return {
    linkset: [
      {
        anchor: abs(API_PATHS.contact),
        'service-desc': [{ href: abs(API_PATHS.spec), type: 'application/vnd.oai.openapi+json;version=3.1' }],
        'service-doc': [{ href: abs(API_PATHS.docs), type: 'text/html' }],
        status: [{ href: abs(API_PATHS.health), type: 'application/health+json' }],
      },
    ],
  };
}

/** Value for the homepage `Link` header: where agents find the machine-readable resources. */
const discoveryLinks = () =>
  [
    `<${API_PATHS.catalog}>; rel="api-catalog"; type="application/linkset+json"`,
    `<${API_PATHS.spec}>; rel="service-desc"; type="application/vnd.oai.openapi+json"`,
    `<${API_PATHS.docs}>; rel="service-doc"; type="text/html"`,
    `<${API_PATHS.llms}>; rel="describedby"; type="text/markdown"`,
  ].join(', ');

const errorCodes = ['bad_request', 'name', 'email', 'message', 'captcha', 'rate_limited', 'send_failed', 'not_configured'];

const inquiry = {
  type: 'object',
  required: ['name', 'email', 'message'],
  properties: {
    name: { type: 'string', maxLength: 120 },
    email: { type: 'string', format: 'email', maxLength: 200 },
    company: { type: 'string', maxLength: 120 },
    topic: { type: 'string', enum: ['job', 'freelance', 'consulting', 'other'], default: 'other' },
    budget: { type: 'string', maxLength: 80 },
    message: { type: 'string', minLength: 10, maxLength: 5000 },
    website: { type: 'string', maxLength: 0, description: 'Honeypot. Leave empty; a filled value is silently dropped.' },
    'cf-turnstile-response': { type: 'string', description: 'Cloudflare Turnstile token. Required when the form shows a captcha.' },
  },
};

const result = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: { ok: { type: 'boolean' }, error: { type: 'string', enum: errorCodes } },
      },
    },
  },
});

const contactOperation = {
  operationId: 'sendInquiry',
  summary: `Send ${site.name} a message`,
  description:
    'Delivers a job, freelance or consulting inquiry by email. Send `Accept: application/json` for a JSON result; ' +
    'without it the endpoint answers with a 303 redirect back to /contact. Rate limited to 3 messages a minute per IP.',
  requestBody: {
    required: true,
    content: { 'application/x-www-form-urlencoded': { schema: inquiry }, 'multipart/form-data': { schema: inquiry } },
  },
  responses: {
    200: result('Sent.'),
    303: { description: 'Redirect to /contact with ?sent or ?error (when the request did not ask for JSON).' },
    400: result('Malformed body, or the field named in `error` is invalid.'),
    403: result('Captcha check failed (`captcha`).'),
    429: result('Too many messages from this IP (`rate_limited`).'),
    502: result('The email provider rejected the message (`send_failed`).'),
    503: result('Email delivery is not configured (`not_configured`).'),
  },
};

const healthOperation = {
  operationId: 'health',
  summary: 'Contact API health',
  responses: {
    200: {
      description: '`pass` when email delivery is configured, `warn` when it is not.',
      content: {
        'application/health+json': {
          schema: { type: 'object', properties: { status: { type: 'string', enum: ['pass', 'warn'] } } },
        },
      },
    },
  },
};

export function openApiSpec(base: URL) {
  return {
    openapi: '3.1.0',
    info: {
      title: `${site.name} contact API`,
      version: '1.0.0',
      description: `Send ${site.name} a job, freelance or consulting inquiry. Human docs: ${new URL(API_PATHS.docs, base)}`,
      contact: { name: site.name, email: site.email, url: new URL('/contact/', base).toString() },
    },
    servers: [{ url: new URL('/', base).toString().replace(/\/$/, '') }],
    paths: {
      [API_PATHS.contact]: { post: contactOperation },
      [API_PATHS.health]: { get: healthOperation },
    },
  };
}

/** The homepage block for a Cloudflare `_headers` file (RFC 8288 Link discovery). */
export const linkHeadersBlock = () => `/\n  Link: ${discoveryLinks()}\n`;
