// Plays Buddy's sprite clips frame by frame with the manifest's own timings.
// The brand rig makes idle frame 0 the neutral pose, and every other clip
// starts and ends one step from it, so switching only ever happens on that
// frame and the cuts don't show. Requests from the visitor (a wave, a hop)
// can't wait out a whole idle loop, so they cut in after URGENT_MS at most.
import { BUDDY_MOODS, type BuddyMood, type Clip } from '../data/buddy';

const IDLE = 'idle';
const URGENT_MS = 400;

export interface PlayerOptions {
  clips: Record<string, Pick<Clip, 'durations'>>;
  /** Random extras between idle loops, with their weights. */
  extras: Record<string, number>;
  /** Idle time before the next extra, picked uniformly in this range (ms). */
  gap: { min: number; max: number };
  draw: (clip: string, frame: number) => void;
  random?: () => number;
}

export class BuddyPlayer {
  private clip = IDLE;
  private frame = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private mood: BuddyMood = 'idle';
  private pending?: string;
  /** Idle time since the last request or mood change. */
  private waited = 0;
  private idleFor = 0;
  private nextGap = 0;
  private lastExtra?: string;
  private readonly random: () => number;

  constructor(private readonly o: PlayerOptions) {
    this.random = o.random ?? Math.random;
    this.nextGap = this.pickGap();
  }

  start() {
    this.show();
  }

  stop() {
    clearTimeout(this.timer);
  }

  /** Plays a clip once, as soon as it can cut in. */
  play(name: string) {
    if (!this.o.clips[name]) return;
    this.pending = name;
    this.waited = 0;
  }

  setMood(mood: BuddyMood) {
    this.mood = mood;
    this.waited = 0;
  }

  private show() {
    this.o.draw(this.clip, this.frame);
    this.timer = setTimeout(this.tick, this.o.clips[this.clip].durations[this.frame]);
  }

  private tick = () => {
    if (this.clip === IDLE) this.countIdle(this.o.clips[IDLE].durations[this.frame]);
    const next = this.clip === IDLE ? this.choose(this.frame === 0) : undefined;
    if (next) this.enter(next);
    else this.step();
    this.show();
  };

  private countIdle(ms: number) {
    this.idleFor += ms;
    this.waited += ms;
  }

  private step() {
    this.frame += 1;
    if (this.frame < this.o.clips[this.clip].durations.length) return;
    // A finished loop or clip lands on the neutral frame.
    this.clip = IDLE;
    this.frame = 0;
  }

  private enter(name: string) {
    this.clip = name;
    this.frame = 0;
    this.waited = 0;
    this.idleFor = 0;
  }

  /** The clip to cut to from idle, if any. `neutral` is true on idle frame 0. */
  private choose(neutral: boolean): string | undefined {
    const urgent = this.pending ?? (this.mood === 'idle' ? undefined : BUDDY_MOODS[this.mood]);
    if (urgent && (neutral || this.waited >= URGENT_MS)) {
      this.pending = undefined;
      return urgent;
    }
    if (!neutral || this.mood !== 'idle' || this.idleFor < this.nextGap) return undefined;
    return this.pickExtra();
  }

  private pickExtra() {
    const options = Object.entries(this.o.extras).filter(([name]) => name !== this.lastExtra && this.o.clips[name]);
    const total = options.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = this.random() * total;
    const [name] = options.find(([, weight]) => (roll -= weight) < 0) ?? options[options.length - 1];
    this.lastExtra = name;
    this.nextGap = this.pickGap();
    return name;
  }

  private pickGap() {
    const { min, max } = this.o.gap;
    return min + this.random() * (max - min);
  }
}
