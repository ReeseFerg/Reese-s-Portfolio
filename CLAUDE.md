# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Reese's UX portfolio: a terminal-styled homepage, a work index, and four case studies.
Vite + React 19 + TypeScript, built to static files. No backend, no tests.

## Commands

```bash
devbox shell           # optional; pins Node 24 via Nix
npm install
npm run dev            # http://localhost:5173
npm run build          # -> dist/
npm run preview        # serve dist/ exactly as deployed
npm run check          # typecheck + eslint + stylelint + prettier — run before committing
npm run format         # prettier, writing fixes
```

There is no test suite. Verification is visual and behavioural instead — see below.

## Branching

`dev` is the integration branch, not `main`. Conductor workspaces default their target
to `origin/main`, so **check out from `origin/dev` first** or you will start from a much
older tree. PRs target `dev`.

## Architecture

**`src/lib/site.ts` is the single route list.** It feeds three consumers: the React
Router table in `App.tsx`, the build-time SEO shells, and the sitemap. Adding a page
means editing that file and adding a route element — nothing else.

**Per-route HTML is generated at build time by the `routeShells` plugin in
`vite.config.ts`.** It takes the built `dist/index.html`, swaps the `<!--seo-->…<!--/seo-->`
block in `index.html` for that route's title/og tags, and writes it to
`dist/work/north-coast-bjj/index.html` and so on. This exists because link scrapers
(LinkedIn, Slack, iMessage) read HTML without running JavaScript, so a plain SPA would
preview every URL with the homepage's title. A side effect worth knowing: real URLs work
on any static host **without rewrite rules**, because the files genuinely exist on disk.
`App.tsx` also sets the same tags client-side for in-app navigation.

**Styles are global CSS in `src/styles/`, not CSS Modules.** They were ported verbatim
from a previous single-file build. Several rules deliberately reach across components
(`body.routed .hero`, `body.on-case .read-progress`, `html[data-type]`), which modules
would make awkward for no real gain. `main.tsx` imports them in a fixed order —
tokens, base, terminal, views, case, dev, **responsive last** — and that order is the
cascade. Don't reorder it. Start at `tokens.css` for any visual change; it holds the
palette, type scale and spacing.

**Case studies are markup, not data.** `src/content/cases/*.tsx` are near-verbatim JSX
conversions of hand-written HTML, still full of `[TODO: …]` copy markers Reese will
replace. Treat them as content: don't refactor them into a schema, and don't "helpfully"
fill in the TODOs. `CASE-STUDIES.md` explains the writing rules and why each case study
is deliberately a different shape.

**Case-study chrome reads the DOM rather than taking props.** `routes/CaseStudy.tsx`
queries `.chapter` and `.toc-link` inside a ref for the scroll-spy and reveal observer.
That's intentional: a case study can add, rename or drop chapters and the TOC keeps
working with no wiring changes.

**The terminal** (`src/components/Terminal/`) owns the homepage. `Terminal.tsx` holds
theme, output log and question-block selection; `CommandInput.tsx` owns the input and
suggestions; commands live in `lib/commands.ts` and map to routes. A document-level
keydown handler drives arrow keys, number keys and "type anywhere to focus the input".

**The dev panel** (`src/components/dev/DevPanel.tsx`) is gated on `import.meta.env.DEV`
and lazily imported, so it is tree-shaken out of production rather than merely hidden.
It switches the open font-preset decision (`html[data-type]`: mono / serif / grotesk /
hybrid) and the media surface. The non-mono families are injected on demand, so
production only ever downloads JetBrains Mono.

## Conventions that look like mistakes but aren't

- **Prettier ignores `.css`; Stylelint owns it.** Letting Prettier reformat the ported
  CSS would explode ~1,100 lines and undo the verbatim port. Don't remove `*.css` from
  `.prettierignore`.
- **Several Stylelint rules are off**, with the reasons written into `.stylelintrc.json`.
  Notably `media-feature-range-notation` — `max-width` is kept over `(width <= 980px)`
  because the newer syntax needs Safari 16.4+, and recruiters open this on old machines.
- **React Router is pinned to 7.18.2 and `npm audit` flags it.** No published version is
  clean: ≤7.17 has two moderate CVEs, ≥7.12 has an RSC-mode CSRF one. 7.18.2's advisory
  needs a server runtime and server actions, which a static SPA has neither of. Do not
  downgrade to "fix" it. `vite-react-ssg` was evaluated and rejected — it hard-pins
  Router 6.
- **`public/resume.pdf` is a generated placeholder** that says so on the page, so the
  Résumé links resolve instead of 404ing. Regenerate via `scripts/make-resume-placeholder.mjs`.
- **`SITE_URL` in `src/lib/site.ts` is still a guess** (`https://reeseferguson.com`) and
  drives every canonical URL, sitemap entry and social tag.

## Verifying a change

There are no unit tests. Instead, `scripts/` holds the tooling used to verify the React
port against the single-file build it replaced (result: 18 differing pixels out of 48.5M).
Use the same approach for any redesign or refactor:

```bash
npm i --no-save playwright && npx playwright install chromium
npm run build && npx vite preview --port 4322 &
node scripts/capture.mjs http://localhost:4322 before   # screenshots all 8 routes, 2 widths
node scripts/smoke.mjs   http://localhost:4322          # 17 behaviour checks
```

`smoke.mjs` covers the things screenshots can't: typewriter, theme switching, slash
commands with Tab-completion, keyboard navigation, routing, legacy hash redirects, the
404, TOC scroll-spy, and that the dev panel is absent from production.

## Design work

`impeccable` is wired in via `.impeccable/`. `/impeccable animate` for motion,
`/impeccable live` for browser-based variant picking. `/impeccable init` and
`/impeccable document` interview the user, so only run them when Reese is present.
