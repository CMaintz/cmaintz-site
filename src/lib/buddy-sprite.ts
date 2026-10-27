// Brings a Buddy.astro sprite to life. With reduced motion he stays in his
// neutral pose and there is no player.
import { BUDDY_CLIPS, BUDDY_EXTRA_GAP, BUDDY_EXTRAS } from '../data/buddy';
import { BuddyPlayer } from './buddy-player';

function draw(el: HTMLElement, clip: string, frame: number) {
  const { sheet, durations } = BUDDY_CLIPS[clip];
  el.style.setProperty('--sheet', `url(${sheet})`);
  el.style.setProperty('--frames', String(durations.length));
  el.style.setProperty('--frame', String(frame));
}

/** Loads every sheet up front, so a clip's first frame never shows blank. */
function preload() {
  for (const { sheet } of Object.values(BUDDY_CLIPS)) new Image().src = sheet;
}

export function animateBuddy(el: HTMLElement): BuddyPlayer | undefined {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
  preload();
  const player = new BuddyPlayer({
    clips: BUDDY_CLIPS,
    extras: BUDDY_EXTRAS,
    gap: BUDDY_EXTRA_GAP,
    draw: (clip, frame) => draw(el, clip, frame),
  });
  player.start();
  return player;
}
