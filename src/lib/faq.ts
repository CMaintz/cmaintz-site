import { faq, type FaqTopic } from '../data/faq';
import type { Lang } from '../i18n/ui';

/** The questions in `lang`, in file order; all of them when no topics are given. */
export function faqFor(lang: Lang, topics?: readonly FaqTopic[]) {
  return faq.filter((f) => !topics || topics.includes(f.topic)).map((f) => ({ q: f.q[lang], a: f.a[lang] }));
}
