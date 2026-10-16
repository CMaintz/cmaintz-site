import type { Lang } from '../../i18n/ui';

/** One "How I work" rule. `proof` names the project slugs it was applied in. */
export interface Principle {
  title: Record<Lang, string>;
  body: Record<Lang, string>;
  proof?: string[];
}
