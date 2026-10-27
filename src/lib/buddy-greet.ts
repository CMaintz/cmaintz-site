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

export const hideGreeting = (g: Greeting) => (g.bubble.hidden = true);

function show(g: Greeting) {
  if (g.busy() || seen()) return;
  g.bubble.querySelector('[data-buddy-greet-text]')!.textContent = pickLine(g.t);
  g.bubble.hidden = false;
  g.player?.play('wave');
  setTimeout(() => hideGreeting(g), SHOW_MS);
}

export function scheduleGreeting(g: Greeting) {
  setTimeout(() => show(g), DELAY_MS);
}
