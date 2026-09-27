import type { APIRoute } from 'astro';
import { RESEND_API_KEY, TURNSTILE_SECRET_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } from 'astro:env/server';
import { parseInquiry, validationError, isHoneypotHit, passesTurnstile, sendInquiry } from '../../lib/contact';

export const prerender = false;

const wantsJson = (req: Request) => (req.headers.get('accept') ?? '').includes('application/json');

/** JSON for the enhanced form; a redirect back to /contact for no-JS posts. */
function reply(req: Request, status: number, error?: string) {
  if (wantsJson(req)) return Response.json({ ok: status < 300, error }, { status });
  const url = new URL('/contact', req.url);
  url.searchParams.set(status < 300 ? 'sent' : 'error', error ?? '1');
  return Response.redirect(url, 303);
}

async function handle(request: Request, form: FormData, ip: string | null) {
  if (isHoneypotHit(form)) return reply(request, 200);
  if (!(await passesTurnstile(form, TURNSTILE_SECRET_KEY, ip))) return reply(request, 403, 'captcha');
  const inquiry = parseInquiry(form);
  const invalid = validationError(inquiry);
  if (invalid) return reply(request, 400, invalid);
  if (!RESEND_API_KEY) return reply(request, 503, 'not_configured');
  const sent = await sendInquiry(inquiry, { apiKey: RESEND_API_KEY, to: CONTACT_TO_EMAIL, from: CONTACT_FROM_EMAIL });
  return reply(request, sent ? 200 : 502, sent ? undefined : 'send_failed');
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const form = await request.formData().catch(() => null);
  if (!form) return reply(request, 400, 'bad_request');
  return handle(request, form, request.headers.get('cf-connecting-ip') ?? clientAddress ?? null);
};
