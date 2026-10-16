import { describe, expect, it } from 'vitest';
import { brief, contactHref, recommend, visibleOptions } from './wizard';
import { steps, recommendations } from '../data/wizard';
import { packages } from '../data/packages';
import { services } from '../data/services';
import { cases } from '../data/cases';

const pain = steps.find((s) => s.id === 'pain')!;

describe('visibleOptions', () => {
  it('shows only the pains written for the chosen audience', () => {
    const ids = visibleOptions(pain, { who: 'tech' }).map((o) => o.id);
    expect(ids).toContain('ci');
    expect(ids).not.toContain('manual-work');
  });

  it('keeps options that have no audience', () => {
    const size = steps.find((s) => s.id === 'size')!;
    expect(visibleOptions(size, { who: 'business' })).toHaveLength(size.options.length);
  });
});

describe('recommend', () => {
  it('follows the pain point', () => {
    expect(recommend({ who: 'tech', pain: 'ci' })).toMatchObject({ pkg: 'gate-starter', service: 'quality-gate' });
  });

  it('starts with the free audit when the budget is small and the package is not', () => {
    expect(recommend({ pain: 'ci', budget: 'small' }).pkg).toBe('mini-audit');
    expect(recommend({ pain: 'ai-content', when: 'exploring' }).pkg).toBe('mini-audit');
  });
});

describe('recommend, cheap starts', () => {
  it('keeps a package that already fits a small budget', () => {
    expect(recommend({ pain: 'manual-work', budget: 'small' }).pkg).toBe('automation-check');
  });

  it('falls back to the free audit for unknown or missing pains', () => {
    expect(recommend({}).pkg).toBe('mini-audit');
    expect(recommend({ pain: 'nope' }).pkg).toBe('mini-audit');
  });
});

describe('recommendations', () => {
  it('cover every pain option', () => {
    for (const o of pain.options) expect(recommendations[o.id], o.id).toBeDefined();
  });

  it('point at packages, services and cases that exist', () => {
    for (const r of Object.values(recommendations)) {
      expect(packages.map((p) => p.id)).toContain(r.pkg);
      expect(services.map((s) => s.id)).toContain(r.service);
      if (r.case) expect(cases.map((c) => c.id)).toContain(r.case);
    }
  });
});

const answers = { who: 'business', pain: 'manual-work', size: '6-20', when: 'asap', budget: 'medium' };

describe('brief', () => {
  it('lists each answered question in step order', () => {
    const lines = brief(answers, 'en');
    expect(lines).toHaveLength(5);
    expect(lines[0]).toBe('Which describes you best? I run or manage a business');
  });

  it('skips unanswered and unknown answers', () => {
    expect(brief({ who: 'tech', size: 'huge' }, 'da')).toEqual([
      'Hvad passer bedst på dig? Jeg er udvikler eller tech lead',
    ]);
  });
});

describe('contactHref', () => {
  it('presets topic, package and message on the localized contact page', () => {
    const url = new URL(contactHref(answers, 'da', 'Hej'), 'https://x.test');
    expect(url.pathname).toBe('/da/contact/');
    expect(url.searchParams.get('topic')).toBe('freelance');
    expect(url.searchParams.get('package')).toBe('automation-check');
    expect(url.searchParams.get('message')).toMatch(/^Hej\n\n- Hvad passer bedst/);
  });

  it('sends the free audit to the audit topic', () => {
    const url = new URL(contactHref({ pain: 'unsure' }, 'en', 'Hi'), 'https://x.test');
    expect(url.searchParams.get('topic')).toBe('audit');
  });
});
