// Buddy's hello: once per visit, a few seconds in, he waves and says one
// line, so visitors notice there is someone to ask. Never over an open chat
// or a conversation already going.
import type { BuddyPlayer } from './buddy-player';
import type { Strings } from './assistant-ui';

const SEEN = 'buddy:greeted';
/** Long enough for the page to settle and the visitor to look around first. */
const DELAY_MS = 4000;
const SHOW_MS = 15000;

export interface Greeting {
  root: HTMLElement;
  bubble: HTMLElement;
  t: Strings;
  player?: BuddyPlayer;
  busy: () => boolean;
  /** Set once it has been hidden, so a pending greeting never comes back. */
  done?: boolean;
}

function seen() {
  try {
    if (sessionStorage.getItem(SEEN)) return true;
    sessionStorage.setItem(SEEN, '1');
  } catch {
    // Storage blocked: greet on every page rather than never.
  }
  return false;
}

function pickLine(t: Strings) {
  const lines = Object.keys(t)
    .filter((k) => /^assistant\.greet\.\d+$/.test(k))
    .map((k) => t[k]);
  return lines[Math.floor(Math.random() * lines.length)] ?? '';
}

/** Hides the bubble for good, e.g. once the visitor has opened the chat themselves. */
export function hideGreeting(g: Greeting) {
  g.done = true;
  // Hiding the focused dismiss button would drop keyboard focus onto <body>.
  if (g.bubble.contains(document.activeElement)) g.root.querySelector<HTMLElement>('[data-buddy-launch]')?.focus();
  g.bubble.hidden = true;
}

function show(g: Greeting) {
  if (g.done || g.busy() || seen()) return;
  g.bubble.hidden = false;
  // Filled a frame after it appears: screen readers skip a live region's first text while it is still hidden.
  requestAnimationFrame(() => (g.bubble.querySelector('[data-buddy-greet-text]')!.textContent = pickLine(g.t)));
  g.player?.play('wave');
  setTimeout(() => hideGreeting(g), SHOW_MS);
}

export function scheduleGreeting(g: Greeting) {
  setTimeout(() => show(g), DELAY_MS);
}
