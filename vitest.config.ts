import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Keystatic's Node build stubs out MDX parsing, so src/keystatic.test.ts loads the
  // browser build the editor actually runs.
  resolve: {
    alias: [
      {
        find: /^@keystatic\/core$/,
        replacement: fileURLToPath(new URL('node_modules/@keystatic/core/dist/keystatic-core.js', import.meta.url)),
      },
      {
        find: /^@keystatic\/core\/content-components$/,
        replacement: fileURLToPath(
          new URL('node_modules/@keystatic/core/dist/keystatic-core-content-components.js', import.meta.url),
        ),
      },
    ],
  },
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['**/*.test.ts'],
      reporter: ['text', 'json-summary'],
    },
  },
});
