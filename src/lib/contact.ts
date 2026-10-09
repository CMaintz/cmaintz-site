// Contact-form domain: validation, spam checks and delivery via Resend.
// Every external dependency is optional; see SETUP.md for the env vars.

export interface Inquiry {
  name: string;
  email: string;
  company: string;
  topic: string;
  budget: string;
  message: string;
}

const TOPICS = ['job', 'freelance', 'audit', 'consulting', 'other'];
const TOPIC_LABELS: Record<string, string> = {
  job: 'job opportunity',
  freelance: 'freelance project',
  audit: 'free mini-audit request',
  consulting: 'consulting',
  other: 'message',
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const field = (form: FormData, key: string, max: number) =>
  String(form.get(key) ?? '')
    .trim()
    .slice(0, max);

export function parseInquiry(form: FormData): Inquiry {
  return {
    name: field(form, 'name', 120),
    email: field(form, 'email', 200),
    company: field(form, 'company', 120),
    topic: TOPICS.includes(field(form, 'topic', 20)) ? field(form, 'topic', 20) : 'other',
    budget: field(form, 'budget', 80),
    message: field(form, 'message', 5000),
  };
}

export function validationError(q: Inquiry): string | null {
  if (!q.name) return 'name';
  if (!EMAIL_RE.test(q.email)) return 'email';
  if (q.message.length < 10) return 'message';
  return null;
}

/** Bots fill the hidden "website" field; humans never see it. */
export const isHoneypotHit = (form: FormData) => String(form.get('website') ?? '') !== '';

/** No secret: Turnstile is off, unless the widget is shown (site key set), then fail closed. */
function verdictWithoutSecret(siteKey: string | undefined) {
  if (siteKey) console.error('contact: PUBLIC_TURNSTILE_SITE_KEY is set but TURNSTILE_SECRET_KEY is missing');
  return !siteKey;
}

function siteverifyBody(form: FormData, secret: string, ip: string | null) {
  const body = new URLSearchParams({ secret, response: String(form.get('cf-turnstile-response') ?? '') });
  if (ip) body.set('remoteip', ip);
  return body;
}

/** Asks Cloudflare whether the token is valid; fails closed if Siteverify can't be reached. */
async function verifyTurnstile(form: FormData, secret: string, ip: string | null) {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: siteverifyBody(form, secret, ip),
    });
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch {
    return false;
  }
}

export const passesTurnstile = async (form: FormData, secret: string | undefined, ip: string | null, siteKey?: string) =>
  secret ? verifyTurnstile(form, secret, ip) : verdictWithoutSecret(siteKey);

const optionalLine = (label: string, value: string) => (value ? [`${label}: ${value}`] : []);

function formatInquiry(q: Inquiry) {
  const header = [
    'Sent from the contact form on https://maintz.dev',
    '',
    `Name: ${q.name}`,
    `Email: ${q.email}`,
    ...optionalLine('Company', q.company),
    `Topic: ${q.topic}`,
    ...optionalLine('Budget', q.budget),
  ];
  return `${header.join('\n')}\n\n${q.message}`;
}

interface MailConfig {
  apiKey: string;
  to: string;
  from: string;
}

function inquirySubject(q: Inquiry) {
  const company = q.company ? ` (${q.company})` : '';
  return `New inquiry via maintz.dev: ${TOPIC_LABELS[q.topic] ?? q.topic} from ${q.name}${company}`;
}

/** The Resend payload for one inquiry; replies go straight to the sender. */
const inquiryEmail = (q: Inquiry, cfg: MailConfig) => ({
  from: cfg.from,
  to: [cfg.to],
  reply_to: q.email,
  subject: inquirySubject(q),
  text: formatInquiry(q),
});

export async function sendInquiry(q: Inquiry, cfg: MailConfig) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(inquiryEmail(q, cfg)),
  });
  return res.ok;
}
