// Buddy, the site assistant: the axolotl from the brand sprites
// (brand/buddy-sprites, rigged from buddy-2.png). buddy-sprites.json is that
// folder's out/manifest.json as generated; each front-<name>-sheet.png is
// copied to public/img/buddy/<name>.png. Regenerate, then copy both again.
import manifest from './buddy-sprites.json';

export interface Clip {
  sheet: string;
  /** Milliseconds per frame, from the manifest. */
  durations: number[];
}

const FRONT = 'front-';

export const BUDDY_CLIPS: Record<string, Clip> = Object.fromEntries(
  Object.entries(manifest)
    .filter(([key]) => key.startsWith(FRONT))
    .map(([key, m]) => [
      key.slice(FRONT.length),
      { sheet: `/img/buddy/${key.slice(FRONT.length)}.png`, durations: m.durations_ms },
    ]),
);

export const BUDDY_FRAME = { width: manifest['front-idle'].frame_width, height: manifest['front-idle'].frame_height };

/** Played between idle loops at random, weighted. Blinks are short, so they come up most. */
export const BUDDY_EXTRAS: Record<string, number> = {
  blink: 5,
  'tail-wag': 2,
  'look-around': 2,
  'scratch-belly': 2,
  'head-shake': 1,
  twirl: 1,
  loop: 1,
  hop: 1,
};

/** Idle time between random extras, in ms. */
export const BUDDY_EXTRA_GAP = { min: 2500, max: 7000 };

/** What repeats while the chat is busy; idle plays the idle loop and extras. */
export const BUDDY_MOODS = { thinking: 'look-around', talking: 'tail-wag' } as const;

export type BuddyMood = 'idle' | keyof typeof BUDDY_MOODS;
