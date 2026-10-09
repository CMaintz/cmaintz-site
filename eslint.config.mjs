import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import foundry from './eslint.config.foundry.mjs';

export default [
  { ignores: ['dist/', 'coverage/', '.astro/', '.wrangler/', '.local/', '.foundry/', 'public/', 'supabase/', 'screenshots/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...foundry,
  {
    languageOptions: {
      // __PAGE_DATES__ is injected at build time by astro.config.mjs (see src/globals.d.ts).
      globals: { ...globals.browser, ...globals.node, __PAGE_DATES__: 'readonly' },
    },
  },
  {
    // habit-hooks' TypeScript sensor and knip already report these; don't double up.
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      // Same width as .prettierrc, so Prettier wraps what it can and this catches the rest.
      'max-len': [
        'error',
        { code: 140, tabWidth: 2, ignoreStrings: true, ignoreTemplateLiterals: true, ignoreRegExpLiterals: true, ignoreUrls: true },
      ],
    },
  },
];
