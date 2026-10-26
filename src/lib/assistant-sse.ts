// Reads the assistant's server-sent events in the browser. EventSource can't
// POST, so the reply comes through fetch and is split into events here.
import type { ChatEvent } from './assistant-chat';

/** Complete events in `buffer`, plus the unfinished tail to prepend to the next chunk. */
export function parseSse(buffer: string): { events: ChatEvent[]; rest: string } {
  const parts = buffer.replace(/\r\n/g, '\n').split('\n\n');
  const rest = parts.pop() ?? '';
  const events = parts.flatMap((block) => {
    const data = block
      .split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trimStart())
      .join('\n');
    try {
      return data ? [JSON.parse(data) as ChatEvent] : [];
    } catch {
      return [];
    }
  });
  return { events, rest };
}

/** Feeds each event of a streamed response body to `onEvent` as it arrives. */
export async function readEvents(body: ReadableStream<Uint8Array>, onEvent: (e: ChatEvent) => void) {
  const reader = body.getReader();
  // stream: true keeps a multi-byte character split across chunks (æ, ø, å) intact.
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const parsed = parseSse(buffer + decoder.decode(value, { stream: true }));
    buffer = parsed.rest;
    parsed.events.forEach(onEvent);
  }
}
