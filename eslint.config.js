import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginAstro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // .astro (no wildcard) holds Astro's generated content/route types
  // (astro:content, astro:content.d.ts) — gitignored build output, not source we
  // own, so it's excluded the same way dist/ is. This is a literal directory-name
  // match, not a `*.astro` glob, so it does not touch our hand-written .astro
  // source files under src/.
  { ignores: ['dist', 'node_modules', '.context', '.playwright-mcp', '.astro'] },
  {
    files: ['**/*.{ts,tsx}'],
    // eslint-plugin-astro's client-side-ts processor gives every <script> block
    // inside a .astro file a virtual filename ending in .ts (foo.astro/0.ts),
    // even for plain `is:inline` scripts with no TS syntax. Without this
    // exclusion those virtual files would match this glob too and pull in the
    // full TS ruleset (no-var, @typescript-eslint/no-unused-vars, ...) for
    // hand-tuned inline scripts that were never meant to be linted as app code
    // — see BaseLayout.astro's `is:inline` scripts, which deliberately use
    // `var` and unused `catch (e)` bindings for maximal, untranspiled
    // compatibility. eslint-plugin-astro's own config for these blocks is a
    // no-op (just turns prettier/prettier off), which is the coverage we want.
    ignores: ['**/*.astro/**'],
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
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // Astro components — SiteHeader.astro carries the site nav, which used to be
  // .tsx and got jsx-a11y linting for free. `recommended` is 5 config objects:
  // a bare plugin registration, 3 scoped to *.astro (and its virtual .js/.ts
  // script blocks) via eslint-plugin-astro's own `files` glob, and one
  // (the 8 `astro/*` rules themselves) with no `files` of its own, so it's
  // technically registered repo-wide. That's harmless here — every one of
  // those rules only matches Astro-parser AST node types, so it's inert on
  // .ts/.tsx — but it doesn't affect the .ts/.tsx block above either way.
  // `jsx-a11y-recommended`'s last object
  // (the actual plugin+rules registration) ships with no `files` of its own —
  // it would otherwise apply repo-wide and collide with the jsx-a11y instance
  // already registered above for .tsx (a different object identity, since
  // eslint-plugin-jsx-a11y's own flatConfigs embed a self-import that isn't
  // reference-equal to a fresh require of the package — ESLint's flat config
  // rejects two different objects registered under the same plugin key for the
  // same file). Pin it to *.astro explicitly so the two never overlap.
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs['jsx-a11y-recommended'].slice(0, -1),
  {
    ...eslintPluginAstro.configs['jsx-a11y-recommended'].at(-1),
    files: ['**/*.astro'],
  },
  {
    files: ['*.config.{js,ts}', '.context/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
);
