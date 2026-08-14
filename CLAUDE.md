# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Reese's UX portfolio: a terminal-styled homepage, a work index, and four case studies.
Astro + React 19 (one island) + TypeScript, built to static files. No backend, no tests.

## Commands

```bash
devbox shell           # optional; pins Node 24 via Nix
npm install
npm run dev            # http://localhost:5173
npm run build           # -> dist/
npm run preview        # serve dist/ exactly as deployed, http://localhost:4321
npm run check           # typecheck (astro check) + eslint + stylelint + prettier — run before committing
npm run format          # prettier, writing fixes
```

There is no test suite. Verification is visual and behavioural instead — see below.

## Branching

`dev` is the integration branch, not `main`. Conductor workspaces default their target
to `origin/main`, so **check out from `origin/dev` first** or you will start from a much
older tree. PRs target `dev`.

## Architecture

**`src/lib/site.ts` is the single route list.** `ROUTES` feeds two consumers: `BaseLayout.astro`
reads it via `metaForPath()` for each page's `<title>`/`og:` tags, and `src/pages/sitemap.xml.ts`
reads it to build the sitemap. `CASE_SLUGS` (also exported from `site.ts`) drives
`src/pages/work/[slug].astro`'s `getStaticPaths()`. Adding a page means editing `site.ts` and
adding the corresponding file under `src/pages/` — nothing else.

**Astro renders every route to a real file at build time — there is no client router deciding
what HTML to serve.** `src/pages/index.astro`, `about.astro`, `contact.astro`, `404.astro` and
`work/index.astro` are static pages; `work/[slug].astro` is a dynamic route whose
`getStaticPaths()` (fed by `CASE_SLUGS`) produces one file per case study. Every page wraps its
content in `src/layouts/BaseLayout.astro`, which builds the per-route `<title>`, `description`
and `og:`/`twitter:` tags from `metaForPath(path)`. This exists for the same reason the old Vite
SPA's build-time SEO-shell plugin existed: link scrapers (LinkedIn, Slack, iMessage) read a
page's HTML without running JavaScript, so a plain SPA shell would preview every URL with the
homepage's title. Astro just does this natively — `output: 'static'` with `build.format:
'directory'` writes `dist/work/north-coast-bjj/index.html` and so on for free, each with its own
correct tags already in the markup. The side effect is the same as before: real URLs work on any
static host **without rewrite rules**, because the files genuinely exist on disk.

**Styles are global CSS in `src/styles/`, not CSS Modules.** They were ported verbatim
from a previous single-file build. Several rules deliberately reach across components
(`body.routed .hero`, `body.on-case .read-progress`, `html[data-type]`), which modules
would make awkward for no real gain. `BaseLayout.astro` (not `main.tsx` — that file is gone)
imports self-hosted JetBrains Mono, then the stylesheets, in a fixed order — fontsource, then
tokens, base, terminal, views, case, dev, **responsive last** — and that order is the cascade.
Don't reorder it. Start at `tokens.css` for any visual change; it holds the palette, type scale
and spacing.

**Case studies are markup, not data.** `src/content/cases/*.tsx` are near-verbatim JSX
conversions of hand-written HTML, still full of `[TODO: …]` copy markers Reese will
replace. Treat them as content: don't refactor them into a schema, and don't "helpfully"
fill in the TODOs. `CASE-STUDIES.md` explains the writing rules and why each case study
is deliberately a different shape.

**Case-study chrome reads the DOM rather than taking props.** `src/scripts/case-chrome.ts`
queries `.chapter` and `.toc-link` inside `[data-case-root]` (the `<div id="case-root"
data-case-root>` every case page wraps its content in) for the scroll-spy and reveal observer.
That's intentional: a case study can add, rename or drop chapters and the TOC keeps working with
no wiring changes. See "View transitions" below for how this script's lifecycle works — that
part is not obvious from reading it top to bottom.

**The terminal** (`src/components/Terminal/`: `Terminal.tsx`, `CommandInput.tsx`, `OutputLog.tsx`,
`PixelLogos.tsx`) owns the homepage and is the site's **only** island — mounted `client:load`
from `src/pages/index.astro`, nowhere else. `Terminal.tsx` holds theme, output log and
question-block selection; `CommandInput.tsx` owns the input and suggestions; commands live in
`lib/commands.ts` and map to routes. A document-level keydown handler drives arrow keys, number
keys and "type anywhere to focus the input".

**The dev panel** (`src/components/dev/DevPanel.tsx`) is mounted `{import.meta.env.DEV && <DevPanel
client:only="react" />}` in `BaseLayout.astro`, so the `import.meta.env.DEV` check is evaluated at
build time and the component is absent from production's rendered HTML and from what actually
runs. It switches the open font-preset decision (`html[data-type]`: mono / serif / grotesk /
hybrid) and the media surface. The non-mono families are injected on demand, so production only
ever downloads JetBrains Mono. One wrinkle: `dist/_astro/DevPanel.*.js` (~2.4 KB) still ships in
the production build, because Astro discovers `client:only` components by a purely syntactic scan
of the template and can't see the `import.meta.env.DEV &&` guard — so it folds the component into
Rollup's entry set unconditionally (upstream `withastro/astro#8659`). The chunk is genuinely
orphaned; nothing in `dist/` references it, and it never executes. Accepted deliberately after
evaluating alternatives — don't "fix" this by restructuring the guard.

## View transitions: scripts run once per document

Astro bundles `<script>` tags as ES modules, which execute once per document. With
`<ClientRouter />` in `BaseLayout.astro`, navigation never creates a new document — it swaps the
`<body>` in place — so a plain top-level binding in a script would run once on whichever page
happened to load the module first and then silently stop working, while anything attached to
`document`/`window` (not to a page's own DOM nodes) survives every swap. This is the single most
important thing a future contributor needs to know and it is invisible in the code.

The pattern, canonically shown in `src/scripts/case-chrome.ts`: all real binding work happens
inside an `astro:page-load` listener (fires on the initial load *and* after every swap), with
teardown on `astro:before-swap`, using one `AbortController` per bind passed as `{ signal }` to
every `addEventListener` call (plus an explicit `observer.disconnect()` for the
`IntersectionObserver`). The two `document.addEventListener('astro:page-load', …)` /
`('astro:before-swap', …)` calls at a script's top level are meant to register once; it's only the
work inside the bind/teardown functions that's supposed to repeat per page. `src/scripts/route-focus.ts`
follows the same shape for a simpler case (focusing `<main>` after an in-app navigation, skipped on
first load).

Two more things this migration confirmed the hard way:

- **`astro:after-swap` does not fire on the initial page load** — it only dispatches from Astro's
  `updateDOM()`, reachable only via `transition()`, itself reachable only from `navigate()` or a
  `popstate` event. Code that must run once on both first load and every subsequent navigation
  wants `astro:page-load`; code that must run only on an actual swap wants `astro:after-swap`.
- **A newly-inserted `<script type="module">` executes before `astro:page-load` dispatches for
  that same navigation.** That's why `case-chrome.ts` can be loaded only from `work/[slug].astro`
  (not from `BaseLayout.astro`) and still work correctly the first time a visitor reaches a case
  page via client-side navigation rather than a deep link.

## Whitespace sensitivity in `.astro` markup

`.astro` templates are whitespace-sensitive in a way JSX is not. JSX strips whitespace that
contains a newline at the edges of an element's children; plain HTML collapses runs of whitespace
to a single space; Astro's `compressHTML` (on by default in production builds) goes further and
**deletes** newline-adjacent whitespace between sibling tags entirely — so `<span>x</span>\n<a>y</a>`
renders with no space between "x" and "y" at all. This cost the Astro migration three separate
rounds of failed screenshot diffs before the cause was found.

`src/pages/404.astro` and `src/pages/contact.astro` both have load-bearing spaces between a
`<span>` and an adjacent `<a>` that would otherwise vanish this way. The fix there is `&#32;`
(a numeric character reference for a space) instead of a literal space — an entity is a text node
to the parser, not whitespace, so it survives `compressHTML` untouched. The obvious alternative,
wrapping the line in `<!-- prettier-ignore -->`, doesn't work here: `prettier-plugin-astro@0.14.1`
has a byte-offset/UTF-16 bug that corrupts markup around a `prettier-ignore`d block when the file
contains multi-byte characters (an ignored `<ul class="contact-list">` came back missing its
opening `<ul`). Both files have inline comments explaining this; don't "clean up" the `&#32;` into
a literal space, and don't reach for `prettier-ignore` as a substitute.

## Conventions that look like mistakes but aren't

- **Prettier ignores `.css`; Stylelint owns it.** Letting Prettier reformat the ported
  CSS would explode ~1,100 lines and undo the verbatim port. Don't remove `*.css` from
  `.prettierignore`.
- **Several Stylelint rules are off**, with the reasons written into `.stylelintrc.json`.
  Notably `media-feature-range-notation` — `max-width` is kept over `(width <= 980px)`
  because the newer syntax needs Safari 16.4+, and recruiters open this on old machines.
- **`eslint-plugin-astro` is pinned to 1.7.0.** 2.x+ requires ESLint ≥10 and this repo is on
  ESLint 9. The jsx-a11y rule set is byte-identical between 1.7.0 and latest, so nothing is lost.
  Revisit only if ESLint is upgraded.
- **The terminal's `--accent` resets to the default on every reload, on every route, by design.**
  `Terminal.tsx` mirrors the chosen accent to `sessionStorage` (not `localStorage`), and
  `BaseLayout.astro`'s `is:inline` script clears that key on every real document load and restores
  it only from the `astro:after-swap` handler — i.e. only across a client-side navigation, never
  on a hard reload. This matches the pre-migration single-file site's behaviour and is
  intentional, not a storage bug.
- **`public/resume.pdf` is a generated placeholder** that says so on the page, so the
  Résumé links resolve instead of 404ing. Regenerate via `scripts/make-resume-placeholder.mjs`.
- **`SITE_URL` in `src/lib/site.ts` is still a guess** (`https://reeseferguson.com`) and
  drives every canonical URL, sitemap entry and social tag.

## Verifying a change

There are no unit tests. Instead, `scripts/` holds the tooling used to verify the Astro port
against the build it replaced (14 of 16 screenshots are pixel-identical; the two homepage shots
differ by ~0.1–0.3% from self-hosting JetBrains Mono in Task 9 — an accepted, owner-reviewed
state, not a bug). Use the same approach for any redesign or refactor:

```bash
npm i --no-save playwright pixelmatch pngjs && npx playwright install chromium
npm run build && npx astro preview --port 4321 &   # not `vite preview` — it doesn't honour
                                                    # trailingSlash: 'never', and falls through
                                                    # to the home shell on every route
node scripts/capture.mjs   http://localhost:4321 before   # screenshots all 8 routes, 2 widths
node scripts/pixeldiff.mjs before after                   # per-image diff counts + y-bands
node scripts/smoke.mjs     http://localhost:4321          # 20 behaviour checks
```

`smoke.mjs` covers the things screenshots can't: typewriter, theme switching, slash commands with
Tab-completion, keyboard navigation, routing, legacy hash redirects, the 404, TOC scroll-spy
(including that it survives repeated client-side navigation without double-binding), `--accent`
surviving a swap, and that neither the dev panel nor any `astro-island` ships on a case page.
`pixeldiff.mjs` reports pixelmatch's differing-pixel count per image and, for anything non-zero,
the bounding box and contiguous y-bands of the differing rows.

## Design work

`impeccable` is wired in via `.impeccable/`. `/impeccable animate` for motion,
`/impeccable live` for browser-based variant picking. `/impeccable init` and
`/impeccable document` interview the user, so only run them when Reese is present.
