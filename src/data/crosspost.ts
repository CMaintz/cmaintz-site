// Where a blog post can be cross-posted. The blog schema, the Keystatic editor and
// scripts/crosspost.mjs all read this list.
export const CROSSPOST_TARGETS = [
  { id: 'devto', label: 'dev.to' },
  { id: 'linkedin', label: 'LinkedIn (drafted as an issue, posted by hand)' },
] as const;

export type CrosspostTarget = (typeof CROSSPOST_TARGETS)[number]['id'];
export const CROSSPOST_IDS = CROSSPOST_TARGETS.map((t) => t.id) as [CrosspostTarget, ...CrosspostTarget[]];
