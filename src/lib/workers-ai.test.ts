import { expect, it, vi } from 'vitest';
import { bindingFetch } from './workers-ai';

const binding = (out: unknown) => ({ run: vi.fn(async () => out) });

it('bindingFetch: sends the model name separately and the rest of the request as inputs', async () => {
  const ai = binding({ choices: [] });
  const body = JSON.stringify({ model: '@cf/x', messages: [{ role: 'user', content: 'hi' }], stream: false });
  await bindingFetch(ai)('https://ignored/v1/chat/completions', { method: 'POST', body });
  expect(ai.run).toHaveBeenCalledWith('@cf/x', { messages: [{ role: 'user', content: 'hi' }], stream: false });
});

it('bindingFetch: gives a tool-calling assistant message empty text instead of null', async () => {
  const ai = binding({ choices: [] });
  const messages = [{ role: 'assistant', content: null, tool_calls: [{ id: 't' }] }];
  await bindingFetch(ai)('https://ignored', { body: JSON.stringify({ model: 'm', messages }) });
  expect(ai.run).toHaveBeenCalledWith('m', {
    messages: [{ role: 'assistant', content: '', tool_calls: [{ id: 't' }] }],
  });
});

it('bindingFetch: passes a streamed answer through as server-sent events', async () => {
  const stream = new Response('data: {"choices":[]}\n\n').body!;
  const res = await bindingFetch(binding(stream))('https://ignored', {
    body: JSON.stringify({ model: 'm', stream: true }),
  });
  expect(res.headers.get('content-type')).toBe('text/event-stream');
  expect(await res.text()).toBe('data: {"choices":[]}\n\n');
});

it('bindingFetch: still splits events when the stream uses CRLF line ends', async () => {
  const sse = 'data: {"choices":[1]}\r\n\r\ndata: {"response":""}\r\n\r\n';
  const res = await bindingFetch(binding(new Response(sse).body!))('https://ignored', {
    body: JSON.stringify({ model: 'm', stream: true }),
  });
  expect(await res.text()).toBe('data: {"choices":[1]}\n\n');
});

it('bindingFetch: drops the closing Workers AI chunk that is not in the OpenAI format', async () => {
  const sse = 'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\ndata: {"response":"","usage":{}}\n\ndata: [DONE]\n\n';
  const res = await bindingFetch(binding(new Response(sse).body!))('https://ignored', {
    body: JSON.stringify({ model: 'm', stream: true }),
  });
  expect(await res.text()).toBe('data: {"choices":[{"delta":{"content":"Hi"}}]}\n\ndata: [DONE]\n\n');
});
