// The assistant widget in the browser. The conversation lives in
// sessionStorage (text only) and goes to /api/assistant whole each turn.
import { readEvents } from './assistant-sse';
import { bubble, renderInto, type Strings } from './assistant-ui';
import { mountLead } from './assistant-lead';
import { API_PATHS } from './api-catalog';
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

const setState = (ui: Ui, state: 'idle' | 'thinking' | 'talking') => (ui.root.dataset.state = state);

function showStatus(ui: Ui, key: string | null) {
  ui.status.textContent = key ? `${ui.t[`assistant.status.${key}`] ?? ui.t['assistant.status.default']}...` : '';
}

function scrollDown(ui: Ui) {
  ui.log.scrollTop = ui.log.scrollHeight;
}

const errorText = (ui: Ui, code: string) => ui.t[`assistant.error.${code}`] ?? ui.t['assistant.error.default'];

/** Collects one streamed reply into a bubble; returns the text when the stream ends. */
class Reply {
  readonly el = bubble('assistant');
  text = '';
  /** Set by a tool call, so the text after it starts a new paragraph. */
  private gap = false;

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
    else if (e.type === 'error') renderInto(this.el, `${this.text}\n\n${errorText(this.ui, e.code)}`.trim());
    scrollDown(this.ui);
  };

  private addText(delta: string) {
    this.text += (this.gap && this.text ? '\n\n' : '') + delta;
    this.gap = false;
    setState(this.ui, 'talking');
    showStatus(this.ui, null);
    renderInto(this.el, this.text);
  }

  private toolStarted(tool: string) {
    this.gap = true;
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

export function mountAssistant(root: HTMLElement) {
  const ui: Ui = {
    root,
    log: root.querySelector('[data-buddy-log]')!,
    form: root.querySelector('[data-buddy-form]')!,
    input: root.querySelector('[data-buddy-input]')!,
    status: root.querySelector('[data-buddy-status]')!,
    t: JSON.parse(root.dataset.strings ?? '{}') as Strings,
    lang: root.dataset.lang ?? 'en',
    siteKey: root.dataset.sitekey ?? '',
  };
  wireInput(ui);
  wireButtons(ui);
  root.hidden = false;
}
