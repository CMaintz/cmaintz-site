import { expect, it } from 'vitest';
import { parseSse, readEvents } from './assistant-sse';
import { sseEvent, type ChatEvent } from './assistant-chat';

const text = (delta: string): ChatEvent => ({ type: 'text', delta });

it('parseSse: keeps an event split across chunks until it is complete', () => {
  const wire = sseEvent(text('Hej')) + sseEvent({ type: 'done' });
  const cut = wire.length - 5;
  const first = parseSse(wire.slice(0, cut));
  expect(first.events).toEqual([text('Hej')]);
  expect(parseSse(first.rest + wire.slice(cut)).events).toEqual([{ type: 'done' }]);
});

it('parseSse: round-trips text with newlines and quotes', () => {
  const e = text('line one\n\n"line two"');
  expect(parseSse(sseEvent(e)).events).toEqual([e]);
});

it('parseSse: skips a malformed event instead of dropping the rest of the stream', () => {
  const wire = 'event: text\ndata: {oops\n\n' + sseEvent({ type: 'done' });
  expect(parseSse(wire).events).toEqual([{ type: 'done' }]);
});

it('readEvents: delivers events from a byte stream cut at arbitrary points', async () => {
  const wire = new TextEncoder().encode(sseEvent(text('æøå')) + sseEvent({ type: 'done' }));
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      for (let i = 0; i < wire.length; i += 7) c.enqueue(wire.slice(i, i + 7));
      c.close();
    },
  });
  const seen: ChatEvent[] = [];
  await readEvents(body, (e) => seen.push(e));
  expect(seen).toEqual([text('æøå'), { type: 'done' }]);
});
