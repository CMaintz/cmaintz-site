// DOM pieces for the assistant widget: message bubbles and the lead card.
// Model text goes in through textContent only (see assistant-markdown.ts).
import { parseMarkdown, type Block, type Inline } from './assistant-markdown';
import type { Inquiry } from './contact';

export type Strings = Record<string, string>;

function inlineNode(i: Inline): Node {
  if (i.t === 'text') return document.createTextNode(i.v);
  const el = document.createElement(i.t === 'bold' ? 'strong' : 'a');
  el.textContent = i.v;
  if (i.t === 'link' && el instanceof HTMLAnchorElement) {
    el.href = i.href;
    if (/^https:/i.test(i.href)) Object.assign(el, { target: '_blank', rel: 'noopener' });
  }
  return el;
}

function blockNode(b: Block): Node {
  if (b.t === 'p') {
    const p = document.createElement('p');
    p.append(...b.inline.map(inlineNode));
    return p;
  }
  const list = document.createElement(b.t);
  list.append(...b.items.map(listItem));
  return list;
}

const listItem = (item: Inline[]) => {
  const li = document.createElement('li');
  li.append(...item.map(inlineNode));
  return li;
};

/** Replaces a bubble's content with the rendered Markdown subset. */
export function renderInto(el: HTMLElement, md: string) {
  el.replaceChildren(...parseMarkdown(md).map(blockNode));
}

export function bubble(role: 'user' | 'assistant', md = '') {
  const el = document.createElement('div');
  el.className = `msg msg--${role}`;
  if (role === 'user') el.textContent = md;
  else renderInto(el, md);
  return el;
}

function field(label: string, name: keyof Inquiry, value: string, multiline = false) {
  const wrapEl = document.createElement('label');
  const input = document.createElement(multiline ? 'textarea' : 'input');
  Object.assign(input, { name, value, required: name !== 'company' });
  if (name === 'email' && input instanceof HTMLInputElement) input.type = 'email';
  if (multiline) (input as HTMLTextAreaElement).rows = 6;
  wrapEl.append(label, input);
  return wrapEl;
}

const hidden = (name: string, value: string) =>
  Object.assign(document.createElement('input'), { type: 'hidden', name, value });

/** What the visitor doesn't edit; `source` makes the email say Buddy drafted it. */
const hiddenFields = (draft: Inquiry) => [
  hidden('topic', draft.topic),
  hidden('budget', draft.budget),
  hidden('source', 'assistant'),
];

const text = (tag: string, className: string, textContent: string) =>
  Object.assign(document.createElement(tag), { className, textContent });

/** The draft as an editable form; sending is up to the caller (the contact endpoint). */
export function leadCard(draft: Inquiry, t: Strings) {
  const form = Object.assign(document.createElement('form'), { className: 'lead' });
  const captcha = text('div', 'lead__captcha', '');
  const send = Object.assign(text('button', 'btn btn--primary', t['assistant.lead.send']), { type: 'submit' });
  form.append(
    text('p', 'lead__title', t['assistant.lead.title']),
    text('p', 'lead__hint', t['assistant.lead.hint']),
    field(t['assistant.lead.name'], 'name', draft.name),
    field(t['assistant.lead.email'], 'email', draft.email),
    field(t['assistant.lead.company'], 'company', draft.company),
    field(t['assistant.lead.message'], 'message', draft.message, true),
    ...hiddenFields(draft),
    captcha,
    send,
  );
  return { form, captcha, send };
}
