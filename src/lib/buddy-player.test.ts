import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { BuddyPlayer } from './buddy-player';

const clips = {
  idle: { sheet: 'idle', durations: Array(8).fill(100) },
  blink: { sheet: 'blink', durations: [100] },
  hop: { sheet: 'hop', durations: [100, 100, 100] },
  wave: { sheet: 'wave', durations: [100, 100, 100, 100] },
  'look-around': { sheet: 'look', durations: [100, 100] },
};
const extras = { blink: 1, hop: 1 };

function setup(random = Math.random) {
  const drawn: [string, number][] = [];
  const player = new BuddyPlayer({
    clips,
    extras,
    gap: { min: 300, max: 300 },
    draw: (clip, frame) => drawn.push([clip, frame]),
    random,
  });
  player.start();
  const current = () => drawn.at(-1)?.[0];
  return { player, drawn, current };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('only cuts from idle into an extra on the neutral idle frame', () => {
  const { drawn } = setup();
  vi.advanceTimersByTime(30_000);
  const cuts = drawn.filter(([clip], i) => i > 0 && clip !== 'idle' && drawn[i - 1][0] === 'idle');
  expect(cuts.length).toBeGreaterThan(5);
  drawn.forEach(([clip, frame], i) => {
    if (i > 0 && clip !== 'idle' && drawn[i - 1][0] === 'idle') expect([drawn[i - 1][1], frame]).toEqual([0, 0]);
  });
});

it('never plays the same random extra twice running', () => {
  const { drawn } = setup(() => 0);
  vi.advanceTimersByTime(30_000);
  const starts = drawn.filter(([clip, frame]) => clip !== 'idle' && frame === 0).map(([clip]) => clip);
  expect(starts.length).toBeGreaterThan(5);
  starts.slice(1).forEach((clip, i) => expect(clip).not.toBe(starts[i]));
});

it('returns to the neutral idle frame after an extra', () => {
  const { drawn } = setup();
  vi.advanceTimersByTime(30_000);
  drawn.forEach(([clip, frame], i) => {
    if (i > 0 && clip === 'idle' && drawn[i - 1][0] !== 'idle') expect(frame).toBe(0);
  });
});

it('starts a requested animation within half a second, without waiting out the idle loop', () => {
  const { player, current } = setup();
  vi.advanceTimersByTime(250);
  player.play('wave');
  vi.advanceTimersByTime(500);
  expect(current()).toBe('wave');
});

it('repeats the mood clip while busy and settles back to idle after', () => {
  const { player, drawn } = setup();
  const lookStarts = () => drawn.filter(([clip, frame]) => clip === 'look-around' && frame === 0).length;
  player.setMood('thinking');
  vi.advanceTimersByTime(3000);
  expect(lookStarts()).toBeGreaterThan(3);
  player.setMood('idle');
  vi.advanceTimersByTime(300);
  const settled = lookStarts();
  vi.advanceTimersByTime(5000);
  expect(lookStarts()).toBe(settled);
});
