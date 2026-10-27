import { expect, it } from 'vitest';
import { APICallError, RetryError } from 'ai';
import { configProblem, failureCode } from './assistant-model';

const ai = { run: async () => ({}) };

it('failureCode: tells a spent daily allowance and a rate limit apart from other failures', () => {
  const quota = new Error('4006: you have used up your daily free allocation of 10,000 neurons');
  expect(failureCode(quota)).toBe('resting');
  const busy = new APICallError({ message: 'slow down', url: 'u', requestBodyValues: {}, statusCode: 429 });
  expect(failureCode(busy)).toBe('busy');
  expect(failureCode(new Error('boom'))).toBe('upstream');
});

it('failureCode: sees a rate limit through the SDK retry wrapper', () => {
  const busy = new APICallError({ message: 'slow down', url: 'u', requestBodyValues: {}, statusCode: 429 });
  const retried = new RetryError({
    message: 'Failed after 2 attempts',
    reason: 'maxRetriesExceeded',
    errors: [busy, busy],
  });
  expect(failureCode(retried)).toBe('busy');
});

it('configProblem: a misspelt provider is reported, not swapped for the default', () => {
  expect(configProblem({ provider: 'antropic', ai })).toMatch(/antropic/);
});

it('configProblem: the default provider needs the AI binding but no key', () => {
  expect(configProblem({})).not.toBeNull();
  expect(configProblem({ ai })).toBeNull();
});

it('configProblem: a keyed provider without its key is not configured', () => {
  expect(configProblem({ provider: 'anthropic', ai })).not.toBeNull();
  expect(configProblem({ provider: 'anthropic', apiKey: 'k' })).toBeNull();
  expect(configProblem({ provider: 'openai-compatible', apiKey: 'k' })).not.toBeNull();
});
