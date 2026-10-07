import { afterEach, describe, expect, it, vi } from 'vitest';
import { isHoneypotHit, parseInquiry, passesTurnstile, sendInquiry, validationError, type Inquiry } from './contact';

const formOf = (fields: Record<string, string>) => {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.set(k, v);
  return form;
};

const valid: Inquiry = {
  name: 'Ada',
  email: 'ada@example.com',
  company: '',
  topic: 'job',
  budget: '',
  message: 'Hello, I have a role for you.',
};

const mockFetch = (impl: () => Promise<unknown>) => {
  const fn = vi.fn(impl);
  vi.stubGlobal('fetch', fn);
  return fn;
};

const jsonResponse = (body: unknown, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) });

const requestOf = (fetch: ReturnType<typeof mockFetch>) => fetch.mock.calls[0] as unknown as [string, RequestInit];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('parseInquiry', () => {
  it('trims every field', () => {
    const q = parseInquiry(formOf({ name: '  Ada  ', email: ' ada@example.com ', message: ' hi there, friend ' }));
    expect(q).toMatchObject({ name: 'Ada', email: 'ada@example.com', message: 'hi there, friend' });
  });

  it('defaults missing fields to empty strings and the topic to "other"', () => {
    expect(parseInquiry(new FormData())).toEqual({ name: '', email: '', company: '', topic: 'other', budget: '', message: '' });
  });
});

describe('parseInquiry limits', () => {
  it('keeps a known topic and replaces an unknown one with "other"', () => {
    expect(parseInquiry(formOf({ topic: 'freelance' })).topic).toBe('freelance');
    expect(parseInquiry(formOf({ topic: 'spam' })).topic).toBe('other');
  });

  it('caps field lengths', () => {
    const q = parseInquiry(formOf({ name: 'x'.repeat(500), message: 'y'.repeat(6000) }));
    expect(q.name).toHaveLength(120);
    expect(q.message).toHaveLength(5000);
  });
});

describe('validationError', () => {
  it('accepts a complete inquiry', () => {
    expect(validationError(valid)).toBeNull();
  });

  it('requires a name', () => {
    expect(validationError({ ...valid, name: '' })).toBe('name');
  });

  it.each(['', 'ada', 'ada@', 'ada@example', 'ada @example.com', 'ada@example.c'])('rejects the email %j', (email) => {
    expect(validationError({ ...valid, email })).toBe('email');
  });
});

describe('validationError message', () => {
  it('requires a message of at least 10 characters', () => {
    expect(validationError({ ...valid, message: 'too short' })).toBe('message');
    expect(validationError({ ...valid, message: 'long enough' })).toBeNull();
  });

  it('reports the first problem in field order', () => {
    expect(validationError({ ...valid, name: '', email: 'bad', message: '' })).toBe('name');
  });
});

describe('isHoneypotHit', () => {
  it('is false when the hidden field is absent or empty', () => {
    expect(isHoneypotHit(new FormData())).toBe(false);
    expect(isHoneypotHit(formOf({ website: '' }))).toBe(false);
  });

  it('is true when a bot fills the hidden field', () => {
    expect(isHoneypotHit(formOf({ website: 'https://spam.example' }))).toBe(true);
  });
});

const form = formOf({ 'cf-turnstile-response': 'token-123' });

describe('passesTurnstile configuration', () => {
  it('passes without calling Cloudflare when Turnstile is not configured', async () => {
    const fetch = mockFetch(() => jsonResponse({ success: false }));
    await expect(passesTurnstile(form, undefined, '1.2.3.4')).resolves.toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fails closed when the widget is shown but the secret is missing', async () => {
    const fetch = mockFetch(() => jsonResponse({ success: true }));
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(passesTurnstile(form, undefined, '1.2.3.4', 'site-key')).resolves.toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledOnce();
  });
});

describe('passesTurnstile request', () => {
  it('sends the secret, token and client IP to Siteverify', async () => {
    const fetch = mockFetch(() => jsonResponse({ success: true }));
    await expect(passesTurnstile(form, 'secret', '1.2.3.4', 'site-key')).resolves.toBe(true);
    const [url, init] = requestOf(fetch);
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(init.method).toBe('POST');
    expect(Object.fromEntries(init.body as URLSearchParams)).toEqual({ secret: 'secret', response: 'token-123', remoteip: '1.2.3.4' });
  });

  it('omits remoteip when the client IP is unknown', async () => {
    const fetch = mockFetch(() => jsonResponse({ success: true }));
    await passesTurnstile(form, 'secret', null);
    expect((requestOf(fetch)[1].body as URLSearchParams).has('remoteip')).toBe(false);
  });
});

describe('passesTurnstile verdict', () => {
  it('rejects a failed challenge', async () => {
    mockFetch(() => jsonResponse({ success: false, 'error-codes': ['invalid-input-response'] }));
    await expect(passesTurnstile(form, 'secret', null)).resolves.toBe(false);
  });

  it('rejects a response without success: true', async () => {
    mockFetch(() => jsonResponse({}));
    await expect(passesTurnstile(form, 'secret', null)).resolves.toBe(false);
  });

  it('fails closed when Siteverify cannot be reached', async () => {
    mockFetch(() => Promise.reject(new TypeError('network down')));
    await expect(passesTurnstile(form, 'secret', null)).resolves.toBe(false);
  });
});

const cfg = { apiKey: 're_test', to: 'me@example.com', from: 'Site <form@example.com>' };

async function sentText(q: Inquiry) {
  const fetch = mockFetch(() => jsonResponse({ id: '1' }));
  await sendInquiry(q, cfg);
  return JSON.parse(requestOf(fetch)[1].body as string).text as string;
}

describe('sendInquiry email body', () => {
  it('lists the sender details, then the message', async () => {
    const lines = ['Sent from the contact form on https://maintz.dev', '', 'Name: Ada', 'Email: ada@example.com'];
    const expected = [...lines, 'Company: Acme', 'Topic: job', 'Budget: 10k', '', valid.message].join('\n');
    await expect(sentText({ ...valid, company: 'Acme', budget: '10k' })).resolves.toBe(expected);
  });

  it('leaves out empty optional fields', async () => {
    const text = await sentText(valid);
    expect(text).not.toContain('Company:');
    expect(text).not.toContain('Budget:');
  });
});

describe('sendInquiry', () => {
  it('posts the inquiry to Resend with reply-to set to the sender', async () => {
    const fetch = mockFetch(() => jsonResponse({ id: '1' }));
    await expect(sendInquiry({ ...valid, company: 'Acme' }, cfg)).resolves.toBe(true);
    const [url, init] = requestOf(fetch);
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer re_test' });
    expect(JSON.parse(init.body as string)).toMatchObject({
      from: cfg.from,
      to: [cfg.to],
      reply_to: valid.email,
      subject: 'New inquiry via maintz.dev: job opportunity from Ada (Acme)',
    });
  });
});

describe('sendInquiry failure', () => {
  it('returns false when Resend rejects the request', async () => {
    mockFetch(() => jsonResponse({ message: 'invalid' }, false));
    await expect(sendInquiry(valid, cfg)).resolves.toBe(false);
  });
});
