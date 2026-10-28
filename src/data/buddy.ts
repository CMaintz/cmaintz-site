// Buddy, the site assistant: the axolotl from the brand sprites
// (brand/buddy-sprites, rigged from buddy-2.png). buddy-sprites.json is that
// folder's out/manifest.json as generated; each front-<name>-sheet.png is
// copied to public/img/buddy/<name>.png. Regenerate, then copy both again.
import manifest from './buddy-sprites.json';

export interface Clip {
  sheet: string;
  /** Milliseconds per frame, from the manifest. */
  durations: number[];
  /** Frame size in sprite pixels; roaming clips are bigger than the idle frame. */
  width: number;
  height: number;
  /** Where the idle frame's top-left sits inside this clip's frame, in sprite pixels. */
  offset: [number, number];
  /** Per-frame drop in sprite pixels that the page adds, so the sprite itself never floats. */
  bob?: number[];
}

interface ManifestEntry {
  frame_width: number;
  frame_height: number;
  durations_ms: number[];
  offset?: number[];
  bob?: number[];
}

const FRONT = 'front-';

export const BUDDY_CLIPS: Record<string, Clip> = Object.fromEntries(
  Object.entries(manifest)
    .filter(([key]) => key.startsWith(FRONT))
    .map(([key, m]) => [key.slice(FRONT.length), toClip(key.slice(FRONT.length), m)]),
);

function toClip(name: string, m: ManifestEntry): Clip {
  const [x = 0, y = 0] = m.offset ?? [];
  return {
    sheet: `/img/buddy/${name}.png`,
    durations: m.durations_ms,
    width: m.frame_width,
    height: m.frame_height,
    offset: [x, y],
    bob: m.bob,
  };
}

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
  swim: 1,
};

/** Idle time between random extras, in ms. */
export const BUDDY_EXTRA_GAP = { min: 2500, max: 7000 };

/** What repeats while the chat is busy; idle plays the idle loop and extras. */
export const BUDDY_MOODS = { thinking: 'look-around', talking: 'tail-wag' } as const;

export type BuddyMood = 'idle' | keyof typeof BUDDY_MOODS;
