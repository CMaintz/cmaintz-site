// The assistant widget in the browser. The conversation lives in
// sessionStorage (text only) and goes to /api/assistant whole each turn.
import { readEvents } from './assistant-sse';
import { bubble, renderInto, type Strings } from './assistant-ui';
import { mountLead } from './assistant-lead';
import { API_PATHS } from './api-catalog';
import { animateBuddy } from './buddy-sprite';
import { hideGreeting, scheduleGreeting, type Greeting } from './buddy-greet';
import type { BuddyPlayer } from './buddy-player';
import type { BuddyMood } from '../data/buddy';
import type { ChatEvent, Turn } from './assistant-chat';

interface Ui {
  root: HTMLElement;
  log: HTMLElement;
  form: HTMLFormElement;
  input: HTMLTextAreaElement;
  status: HTMLElement;
  t: Strings;
  lang: string;
  siteKey: string;
  /** The reply in flight; New chat aborts it so it can't write into the fresh conversation. */
  pending?: AbortController;
  player?: BuddyPlayer;
  greeting: Greeting;
}

const STORE = 'buddy:chat';

function loadHistory(): Turn[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORE) ?? '[]') as Turn[];
  } catch {
    return [];
  }
}

function saveHistory(turns: Turn[]) {
  try {
    sessionStorage.setItem(STORE, JSON.stringify(turns));
  } catch {
    // Private mode or storage blocked: the chat still works, it just won't survive a page change.
  }
}

function setState(ui: Ui, state: BuddyMood) {
  ui.root.dataset.state = state;
  ui.player?.setMood(state);
}

function showStatus(ui: Ui, key: string | null) {
  ui.status.textContent = key ? `${ui.t[`assistant.status.${key}`] ?? ui.t['assistant.status.default']}...` : '';
}

function scrollDown(ui: Ui) {
  ui.log.scrollTop = ui.log.scrollHeight;
}

const errorText = (ui: Ui, code: string) => ui.t[`assistant.error.${code}`] ?? ui.t['assistant.error.default'];

/**
 * Collects one streamed reply. Text written after a tool call goes in a
 * bubble of its own, so a bubble never repeats what the one above it said.
 */
class Reply {
  private el = bubble('assistant');
  /** Everything said, for the history. */
  text = '';
  /** What the current bubble shows. */
  private shown = '';
  private afterTool = false;

  constructor(
    private ui: Ui,
    private signal: AbortSignal,
  ) {
    ui.log.append(this.el);
  }

  on = (e: ChatEvent) => {
    if (this.signal.aborted) return;
    if (e.type === 'text') this.addText(e.delta);
    else if (e.type === 'status') this.toolStarted(e.tool);
    else if (e.type === 'lead') this.ui.log.append(mountLead(e.draft, this.ui.t, this.ui.siteKey));
    else if (e.type === 'error') renderInto(this.el, `${this.shown}\n\n${errorText(this.ui, e.code)}`.trim());
    scrollDown(this.ui);
  };

  private addText(delta: string) {
    if (this.afterTool && this.shown) this.nextBubble();
    this.afterTool = false;
    this.shown += delta;
    this.text += delta;
    setState(this.ui, 'talking');
    showStatus(this.ui, null);
    renderInto(this.el, this.shown);
  }

  private nextBubble() {
    this.el = bubble('assistant');
    this.ui.log.append(this.el);
    this.shown = '';
    this.text += '\n\n';
  }

  private toolStarted(tool: string) {
    this.afterTool = true;
    setState(this.ui, 'thinking');
    showStatus(this.ui, tool);
  }
}

async function postChat(ui: Ui, turns: Turn[], signal: AbortSignal) {
  return fetch(API_PATHS.assistant, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: turns, lang: ui.lang, page: location.pathname }),
  });
}

async function ask(ui: Ui, turns: Turn[]) {
  const pending = new AbortController();
  ui.pending = pending;
  const reply = new Reply(ui, pending.signal);
  const res = await postChat(ui, turns, pending.signal).catch(() => null);
  if (!res?.ok || !res.body) {
    const code = res ? ((await res.json().catch(() => ({}))) as { error?: string }).error : undefined;
    return reply.on({ type: 'error', code: code ?? 'network' });
  }
  await readEvents(res.body, reply.on);
  if (reply.text && !pending.signal.aborted) saveHistory([...turns, { role: 'assistant', content: reply.text }]);
}

async function submit(ui: Ui) {
  const question = ui.input.value.trim();
  if (!question || ui.root.dataset.busy) return;
  const turns: Turn[] = [...loadHistory(), { role: 'user', content: question }];
  saveHistory(turns);
  ui.input.value = '';
  ui.log.append(bubble('user', question));
  ui.root.dataset.busy = '1';
  setState(ui, 'thinking');
  showStatus(ui, 'thinking');
  await ask(ui, turns).catch(() => undefined);
  delete ui.root.dataset.busy;
  setState(ui, 'idle');
  showStatus(ui, null);
  scrollDown(ui);
}

function restore(ui: Ui) {
  ui.log.replaceChildren(bubble('assistant', ui.t['assistant.hello']));
  for (const turn of loadHistory()) ui.log.append(bubble(turn.role, turn.content));
  scrollDown(ui);
}

function reset(ui: Ui) {
  ui.pending?.abort();
  saveHistory([]);
  restore(ui);
  ui.input.focus();
}

function toggle(ui: Ui, open: boolean) {
  ui.root.toggleAttribute('data-open', open);
  hideGreeting(ui.greeting);
  ui.root.querySelector('[data-buddy-launch]')?.setAttribute('aria-expanded', String(open));
  if (!open) return ui.root.querySelector<HTMLElement>('[data-buddy-launch]')?.focus();
  // Only on first open: rebuilding later would drop a lead card the visitor hasn't sent yet.
  if (!ui.log.childElementCount) restore(ui);
  ui.input.focus();
}

function askSuggestion(ui: Ui, question: string) {
  ui.input.value = question;
  void submit(ui);
}

function wireInput(ui: Ui) {
  ui.form.addEventListener('submit', (e) => {
    e.preventDefault();
    void submit(ui);
  });
  // Enter sends, Shift+Enter adds a line, as in most chat apps.
  ui.input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    void submit(ui);
  });
}

function wireButtons(ui: Ui) {
  ui.root
    .querySelector('[data-buddy-launch]')
    ?.addEventListener('click', () => toggle(ui, !ui.root.hasAttribute('data-open')));
  ui.root.querySelector('[data-buddy-close]')?.addEventListener('click', () => toggle(ui, false));
  ui.root.querySelector('[data-buddy-reset]')?.addEventListener('click', () => reset(ui));
  // Esc in the lead card is left alone, so it can't close the window on a half-edited message.
  ui.root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !(e.target as Element).closest('.lead')) toggle(ui, false);
  });
  ui.root
    .querySelectorAll<HTMLButtonElement>('[data-buddy-suggest]')
    .forEach((b) => b.addEventListener('click', () => askSuggestion(ui, b.textContent ?? '')));
}

function wireBuddy(ui: Ui) {
  const launch = ui.root.querySelector<HTMLElement>('[data-buddy-launch]')!;
  launch.addEventListener('pointerenter', () => ui.player?.play('hop'));
  const bubbleEl = ui.greeting.bubble;
  bubbleEl.querySelector('[data-buddy-greet-open]')?.addEventListener('click', () => toggle(ui, true));
  bubbleEl.querySelector('[data-buddy-greet-close]')?.addEventListener('click', () => hideGreeting(ui.greeting));
  scheduleGreeting(ui.greeting);
}

function greetingFor(root: HTMLElement, t: Strings, player?: BuddyPlayer): Greeting {
  const bubbleEl = root.querySelector<HTMLElement>('[data-buddy-greet]')!;
  // A visitor already chatting or with the window open needs no invitation.
  const busy = () => root.hasAttribute('data-open') || loadHistory().length > 0;
  return { root, bubble: bubbleEl, t, player, busy };
}

function uiFor(root: HTMLElement): Ui {
  const t = JSON.parse(root.dataset.strings ?? '{}') as Strings;
  const player = animateBuddy(root.querySelector<HTMLElement>('[data-buddy-launch] [data-buddy-sprite]')!);
  return {
    root,
    log: root.querySelector('[data-buddy-log]')!,
    form: root.querySelector('[data-buddy-form]')!,
    input: root.querySelector('[data-buddy-input]')!,
    status: root.querySelector('[data-buddy-status]')!,
    t,
    lang: root.dataset.lang ?? 'en',
    siteKey: root.dataset.sitekey ?? '',
    player,
    greeting: greetingFor(root, t, player),
  };
}

export function mountAssistant(root: HTMLElement) {
  const ui = uiFor(root);
  wireInput(ui);
  wireButtons(ui);
  wireBuddy(ui);
  root.hidden = false;
}
