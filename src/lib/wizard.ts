// The /start wizard's decisions: which options a step shows, what to recommend,
// and the contact-form link that carries the visitor's answers along.
import { type Lang, localize } from '../i18n/ui';
import { packages } from '../data/packages';
import { steps, recommendations, type Recommendation, type WizardStep } from '../data/wizard';

export type Answers = Partial<Record<WizardStep['id'], string>>;

/** Above this price, a visitor with a small budget or no timeline starts with the free audit. */
const CHEAP_START_DKK = 5000;
const FALLBACK: Recommendation = recommendations.unsure;

/** A step's options, without those written for the other audience. */
export function visibleOptions(step: WizardStep, answers: Answers) {
  return step.options.filter((o) => !o.audience || o.audience === answers.who);
}

const priceOf = (pkgId: string) => packages.find((p) => p.id === pkgId)?.priceDkk ?? 0;

/** The package, service and case to suggest for a set of answers. */
export function recommend(answers: Answers): Recommendation {
  const base = (answers.pain && recommendations[answers.pain]) || FALLBACK;
  const cautious = answers.budget === 'small' || answers.when === 'exploring';
  if (cautious && priceOf(base.pkg) > CHEAP_START_DKK) return { ...base, pkg: 'mini-audit' };
  return base;
}

/** "Question: answer" lines, in step order, for the message field. */
export function brief(answers: Answers, lang: Lang) {
  return steps.flatMap((step) => {
    const option = step.options.find((o) => o.id === answers[step.id]);
    return option ? [`${step.question[lang]} ${option.label[lang]}`] : [];
  });
}

/** The contact form, preset to the recommended package with the answers as the message. */
export function contactHref(answers: Answers, lang: Lang, intro: string) {
  const { pkg } = recommend(answers);
  const topic = packages.find((p) => p.id === pkg)?.topic ?? 'freelance';
  const message = [intro, '', ...brief(answers, lang).map((line) => `- ${line}`), '', ''].join('\n');
  const query = new URLSearchParams({ topic, package: pkg, message });
  return `${localize('/contact', lang)}?${query}`;
}
