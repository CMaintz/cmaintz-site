import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import foundry from './eslint.config.foundry.mjs';

export default [
  {
    ignores: [
      'dist/',
      'coverage/',
      '.astro/',
      '.wrangler/',
      '.local/',
      '.foundry/',
      'public/',
      'supabase/',
      'screenshots/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...foundry,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    // habit-hooks' TypeScript sensor and knip already report these; don't double up.
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    // Markup lines (long attribute lists, inline text) are not held to a width; Prettier
    // does not format .astro either. Code size there is still capped by check-code-size.mjs.
    files: ['**/*.astro'],
    rules: { 'max-len': 'off' },
  },
];
