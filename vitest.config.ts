import { defineConfig } from 'vitest/config';

/**
 * Scoped deliberately to the dev editor's pure logic.
 *
 * The rest of this repo has no unit tests on purpose — verification is visual
 * and behavioural (scripts/capture.mjs, scripts/pixeldiff.mjs, scripts/smoke.mjs).
 * The editor is the exception because it is the only thing here that writes to
 * the user's own source files, and the failure mode is corrupting hand-written
 * case-study copy. Match uniqueness, path containment and replacement validation
 * are worth testing directly rather than only through a browser.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
