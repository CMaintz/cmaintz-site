// The four "What I do" areas. Projects, posts and services reference these ids,
// which is what ties content to the focus areas on the homepage.
import type { Lang } from '../i18n/ui';

export const AREA_IDS = ['dx', 'devops', 'platform', 'ai'] as const;
export type AreaId = (typeof AREA_IDS)[number];

export const areaLabels: Record<AreaId, Record<Lang, string>> = {
  dx: { en: 'Developer Experience', da: 'Developer Experience' },
  devops: { en: 'DevOps & CI/CD', da: 'DevOps & CI/CD' },
  platform: { en: 'Platform & Infrastructure', da: 'Platform & infrastruktur' },
  ai: { en: 'AI enablement', da: 'AI-enablement' },
};
