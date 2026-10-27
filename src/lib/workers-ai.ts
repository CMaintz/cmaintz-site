// Lets an OpenAI-style client talk to Workers AI through the Worker's AI
// binding instead of over HTTP, so no API token is needed.

/** The slice of the Workers AI binding this uses. */
export interface AiBinding {
  run(model: string, inputs: Record<string, unknown>): Promise<unknown>;
}

/** An SSE event worth passing on: an OpenAI chunk or the end marker. */
const isOpenAiEvent = (event: string) => !event.startsWith('data: {') || event.includes('"choices"');

/**
 * Workers AI closes a stream with one extra chunk in its own format
 * ({"response": "", "usage": ...}), which the OpenAI-compatible provider
 * rejects as malformed. This drops it and passes everything else as is.
 */
function openAiEventsOnly(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffered = '';
  const pass = (events: string[], out: TransformStreamDefaultController<Uint8Array>) =>
    events.filter((e) => e.trim() && isOpenAiEvent(e)).forEach((e) => out.enqueue(encoder.encode(`${e}\n\n`)));
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, out) {
        const events = (buffered + decoder.decode(chunk, { stream: true })).split(/\r?\n\r?\n/);
        buffered = events.pop() ?? '';
        pass(events, out);
      },
      flush: (out) => pass([buffered + decoder.decode()], out),
    }),
  );
}

/**
 * OpenAI sends an assistant message that only calls tools with content null;
 * some Workers AI models (gpt-oss) reject anything but a string there.
 */
const withTextContent = (messages: unknown) =>
  Array.isArray(messages)
    ? messages.map((m: Record<string, unknown>) => (m.content == null ? { ...m, content: '' } : m))
    : messages;

/**
 * Workers AI answers the binding in the OpenAI chat format, streamed or not,
 * so an OpenAI-compatible client can drive it once its HTTP call is
 * redirected to the binding. This fetch is that redirect; the URL is ignored.
 */
export const bindingFetch =
  (ai: AiBinding): typeof fetch =>
  async (_url, init) => {
    const { model, messages, ...inputs } = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
    const out = await ai.run(String(model), { ...inputs, messages: withTextContent(messages) });
    if (!(out instanceof ReadableStream)) return Response.json(out);
    return new Response(openAiEventsOnly(out), { headers: { 'Content-Type': 'text/event-stream' } });
  };
