import { describe, expect, it } from 'vitest';
import { FAQ_TOPICS, faq } from '../data/faq';
import { faqFor } from './faq';

describe('faqFor', () => {
  it('returns only the questions on the asked topics', () => {
    const pricing = faq.filter((f) => f.topic === 'pricing').map((f) => f.q.da);
    expect(faqFor('da', ['pricing']).map((f) => f.q)).toEqual(pricing);
  });

  it('returns every question when no topic is given', () => {
    expect(faqFor('en')).toHaveLength(faq.length);
  });

  it.each(FAQ_TOPICS)('has questions for topic %s', (topic) => {
    expect(faqFor('en', [topic]).length).toBeGreaterThan(0);
  });
});
