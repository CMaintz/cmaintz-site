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

const TOPICS = ['job', 'freelance', 'consulting', 'other'];
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

export async function passesTurnstile(form: FormData, secret: string | undefined, ip: string | null) {
  if (!secret) return true;
  const body = new URLSearchParams({ secret, response: String(form.get('cf-turnstile-response') ?? '') });
  if (ip) body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}

export function formatInquiry(q: Inquiry) {
  const header = [
    `Name: ${q.name}`,
    `Email: ${q.email}`,
    q.company && `Company: ${q.company}`,
    `Topic: ${q.topic}`,
    q.budget && `Budget: ${q.budget}`,
  ].filter(Boolean);
  return `${header.join('\n')}\n\n${q.message}`;
}

interface MailConfig {
  apiKey: string;
  to: string;
  from: string;
}

export async function sendInquiry(q: Inquiry, cfg: MailConfig) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: cfg.from,
      to: [cfg.to],
      reply_to: q.email,
      subject: `[website] ${q.topic}: ${q.name}${q.company ? ` (${q.company})` : ''}`,
      text: formatInquiry(q),
    }),
  });
  return res.ok;
}
