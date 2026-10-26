// The lead card in the assistant widget: the model's draft as a form the
// visitor edits and sends through the ordinary contact endpoint.
import { bubble, leadCard, type Strings } from './assistant-ui';
import { API_PATHS } from './api-catalog';
import type { Inquiry } from './contact';

interface Turnstile {
  render(el: HTMLElement, opts: { sitekey: string; theme: string }): string | undefined;
  reset(widgetId?: string): void;
}

const turnstile = () => (window as { turnstile?: Turnstile }).turnstile;

/**
 * Renders Turnstile into `el`, loading the script on first need. Returns a reset
 * function: the contact endpoint spends a token even when delivery then fails,
 * so a retry needs a fresh one.
 */
function mountCaptcha(el: HTMLElement, siteKey: string) {
  let id: string | undefined;
  const render = () => (id = turnstile()?.render(el, { sitekey: siteKey, theme: 'auto' }));
  if (turnstile()) render();
  else {
    const s = Object.assign(document.createElement('script'), {
      src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
      async: true,
    });
    s.addEventListener('load', render);
    document.head.append(s);
  }
  return () => turnstile()?.reset(id);
}

/** The contact endpoint's error code, or null when the message went through. */
async function sendLead(form: HTMLFormElement) {
  const data = new FormData(form);
  data.set('website', '');
  const res = await fetch(API_PATHS.contact, { method: 'POST', headers: { Accept: 'application/json' }, body: data });
  if (res.ok) return null;
  return ((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'failed';
}

const failureText = (t: Strings, code: string) =>
  ({ captcha: t['assistant.lead.captcha'], rate_limited: t['assistant.error.rate_limited'] })[code] ??
  t['assistant.lead.failed'];

export function mountLead(draft: Inquiry, t: Strings, siteKey: string) {
  const { form, captcha, send } = leadCard(draft, t);
  const resetCaptcha = siteKey ? mountCaptcha(captcha, siteKey) : () => undefined;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    send.setAttribute('disabled', '');
    const error = await sendLead(form).catch(() => 'network');
    if (!error) return form.replaceChildren(bubble('assistant', t['assistant.lead.sent']));
    resetCaptcha();
    send.removeAttribute('disabled');
    form.append(bubble('assistant', failureText(t, error)));
  });
  return form;
}
