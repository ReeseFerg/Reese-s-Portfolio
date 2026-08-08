import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.context', '.playwright-mcp'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      // `flat` is the flat-config shape; `recommended-latest` still declares
      // plugins as an array, which ESLint 9 rejects.
      reactHooks.configs.flat.recommended,
      // Catches markup that would be unusable with a keyboard or screen
      // reader — the terminal is heavily keyboard-driven, so this earns its keep.
      jsxA11y.flatConfigs.recommended,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['*.config.{js,ts}', '.context/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
);
