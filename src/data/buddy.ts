// Buddy, the site assistant: the axolotl from the brand sprites
// (brand/buddy-sprites/out, rigged from buddy-2.png). Each animation is a
// horizontal sheet in public/img/buddy/; Buddy.astro steps through it with CSS.

export const BUDDY_FRAME = { width: 41, height: 50 };

/** Which sheet plays in which state. `ms` is the whole loop; frames get equal time. */
export const BUDDY_ANIMATIONS = {
  idle: { sheet: '/img/buddy/idle.png', frames: 24, ms: 2880 },
  thinking: { sheet: '/img/buddy/look-around.png', frames: 11, ms: 1530 },
  talking: { sheet: '/img/buddy/tail-wag.png', frames: 12, ms: 840 },
  hop: { sheet: '/img/buddy/hop.png', frames: 7, ms: 600 },
} as const;
