/**
 * Each effect is a data-* flag on <html>, stored as fx-<id> and applied before first paint by Base.astro.
 * `fallback` is where its value comes from when nothing is stored yet: the old single 'crt' switch, or
 * the OS reduced-motion setting.
 */
export const DISPLAY_EFFECTS = [
  { id: 'scan', fallback: 'legacy-crt' },
  { id: 'glow', fallback: 'legacy-crt' },
  { id: 'motion', fallback: 'reduced-motion' },
] as const;

export const DISPLAY_EFFECT_IDS = DISPLAY_EFFECTS.map((e) => e.id);
