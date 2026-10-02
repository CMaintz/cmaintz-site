import type { APIRoute } from 'astro';
import { RESEND_API_KEY, TURNSTILE_SECRET_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } from 'astro:env/server';
import { PUBLIC_TURNSTILE_SITE_KEY } from 'astro:env/client';
import { parseInquiry, validationError, isHoneypotHit, passesTurnstile, sendInquiry, type Inquiry } from '../../lib/contact';

export const prerender = false;

const wantsJson = (req: Request) => (req.headers.get('accept') ?? '').includes('application/json');

/** JSON for the enhanced form; a redirect back to /contact for no-JS posts. */
function reply(req: Request, status: number, error?: string) {
  if (wantsJson(req)) return Response.json({ ok: status < 300, error }, { status });
  const url = new URL('/contact', req.url);
  url.searchParams.set(status < 300 ? 'sent' : 'error', error ?? '1');
  return Response.redirect(url, 303);
}

type Outcome = { status: number; error?: string };

/** Bots get a silent 200 (honeypot) or a 403 (captcha); humans get null. */
async function botOutcome(form: FormData, ip: string | null): Promise<Outcome | null> {
  if (isHoneypotHit(form)) return { status: 200 };
  if (!(await passesTurnstile(form, TURNSTILE_SECRET_KEY, ip, PUBLIC_TURNSTILE_SITE_KEY))) return { status: 403, error: 'captcha' };
  return null;
}

async function deliver(inquiry: Inquiry): Promise<Outcome> {
  const invalid = validationError(inquiry);
  if (invalid) return { status: 400, error: invalid };
  if (!RESEND_API_KEY) return { status: 503, error: 'not_configured' };
  const sent = await sendInquiry(inquiry, { apiKey: RESEND_API_KEY, to: CONTACT_TO_EMAIL, from: CONTACT_FROM_EMAIL });
  return sent ? { status: 200 } : { status: 502, error: 'send_failed' };
}

async function handle(request: Request, form: FormData, ip: string | null) {
  const { status, error } = (await botOutcome(form, ip)) ?? (await deliver(parseInquiry(form)));
  return reply(request, status, error);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const form = await request.formData().catch(() => null);
  if (!form) return reply(request, 400, 'bad_request');
  return handle(request, form, request.headers.get('cf-connecting-ip') ?? clientAddress ?? null);
};
