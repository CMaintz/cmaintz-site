import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import foundry from './eslint.config.foundry.mjs';

// Import layering: pages -> views -> layouts -> components -> lib -> data -> i18n.
// Each layer may import itself and anything to its right, never to its left.
const LAYERS = ['pages', 'views', 'layouts', 'components', 'lib', 'data', 'i18n'];
const layerRules = LAYERS.slice(1).map((layer, i) => ({
  files: [`src/${layer}/**`],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            regex: `(^|/)(${LAYERS.slice(0, i + 1).join('|')})/`,
            message: `${layer} sits below these layers and must not import from them.`,
          },
        ],
      },
    ],
  },
}));

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
  ...layerRules,
];
