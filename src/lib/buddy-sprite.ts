// Brings a Buddy.astro sprite to life. With reduced motion he stays in his
// neutral pose and there is no player.
import { BUDDY_CLIPS, BUDDY_EXTRA_GAP, BUDDY_EXTRAS, type Clip } from '../data/buddy';
import { BuddyPlayer } from './buddy-player';

/**
 * The drop (sprite px) to glide towards while `frame` shows: the next
 * frame's, so the float eases between frames instead of stepping. Clips
 * without a float hold 0, which is where the idle starts and ends.
 */
export function floatTarget(clip: Pick<Clip, 'bob'>, frame: number): number {
  const { bob } = clip;
  return bob ? bob[(frame + 1) % bob.length] : 0;
}

function draw(el: HTMLElement, clip: string, frame: number) {
  const c = BUDDY_CLIPS[clip];
  const sprite = el.firstElementChild as HTMLElement;
  const scale = Number(el.style.getPropertyValue('--scale')) || 1;
  sprite.style.setProperty('--frame', String(frame));
  sprite.style.setProperty('--y', `${c.y}px`);
  sprite.style.setProperty('--cw', `${c.width}px`);
  sprite.style.setProperty('--ch', `${c.height}px`);
  sprite.style.setProperty('--ox', `${c.offset[0]}px`);
  sprite.style.setProperty('--oy', `${c.offset[1]}px`);
  // transform itself transitions; a custom property would jump.
  sprite.style.transition = `transform ${c.durations[frame]}ms linear`;
  sprite.style.transform = `translateY(${floatTarget(c, frame) * scale}px)`;
}

export function animateBuddy(el: HTMLElement): BuddyPlayer | undefined {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
  const player = new BuddyPlayer({
    clips: BUDDY_CLIPS,
    extras: BUDDY_EXTRAS,
    gap: BUDDY_EXTRA_GAP,
    draw: (clip, frame) => draw(el, clip, frame),
  });
  player.start();
  return player;
}
