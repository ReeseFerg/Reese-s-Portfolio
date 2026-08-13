# Dev-only visual editor — design

**Date:** 2026-08-13
**Status:** approved, ready for an implementation plan

## Why

The portfolio has **120 `[TODO: …]` copy markers** waiting on Reese's writing — 58 in
`NorthCoastBjj.tsx`, 18 each in `SavrApp.tsx` and `Databrew.tsx`, 12 in `ProjectCadence.tsx`,
11 in `work/index.astro`, and a handful across `about.astro` and `contact.astro`. Every media
block is still a dashed placeholder.

Filling those in by describing each edit to an agent is slow and indirect. The point of this
feature is to let Reese **type into the page and have it land in the source**, so a first draft
of the portfolio can be written in the browser rather than as a sequence of prompts.

Scope was deliberately cut to **text and media**. Font and colour presets already exist in
`DevPanel.tsx`; layout editing was considered and dropped as a page-builder-sized project that
would consume the time the portfolio itself needs.

## Constraints this design is shaped by

1. **Case studies are markup, not data.** `CLAUDE.md` and `CASE-STUDIES.md` are explicit: each
   case study is deliberately a different shape, and they must not be refactored into a schema.
   Any design that needs components to read from a content layer is disqualified.
2. **`.astro` markup is whitespace-sensitive.** JSX strips whitespace-containing-newlines at the
   edges of an element's children; HTML collapses it to a space; Astro's `compressHTML` deletes
   newline-adjacent whitespace between sibling tags entirely. `404.astro` and `contact.astro`
   use `&#32;` entities for load-bearing spaces. This cost the Astro migration three rounds of
   failed screenshot diffs.
3. **`prettier-plugin-astro@0.14.1` corrupts markup** around `<!-- prettier-ignore -->` on files
   containing multi-byte characters. Not available as an escape hatch.
4. **The site is `output: 'static'`** with no adapter and no server in production.
5. **The editor must not ship.** Not "hidden in production" — absent from it.

## Approach

A **dev-only Vite middleware that string-replaces in source files.**

The browser sends `{ route, before, after }`. The server derives a candidate file set from the
route, requires `before` to appear **exactly once** across that set, replaces it, runs Prettier
on the touched file, and lets Vite HMR reload the page. Edits land as ordinary uncommitted git
changes.

Two properties make this fit:

- **Zero changes to content files.** No IDs, no data layer, no schema — satisfying constraint 1,
  which every conventional editor design violates.
- **Dev-only structurally, not by a flag.** It mounts from Astro's `astro:server:setup` hook,
  which only runs under `astro dev`. Under `output: 'static'` there is no production server for
  it to exist on. This is stronger than the `import.meta.env.DEV` guard already known to leak an
  orphaned 2.4KB chunk into `dist/` (`withastro/astro#8659`).

### Alternatives rejected

**Overrides JSON layer**, with edits written to a sidecar file that components consult in dev and
a CLI command that bakes them into source. Safer against mid-edit corruption, but every editable
component must read the override layer — precisely the schema refactor constraint 1 forbids — and
it creates dev/prod divergence.

**Astro content collections + a local CMS** (Decap/Sveltia). A real editing UI, battle-tested. But
it is a large migration that destroys the hand-authored markup, and a uniform content schema
cannot express case studies that are each deliberately a different shape.

## Components

### 1. `astro-dev-editor` integration (`src/integrations/dev-editor.ts`)

Registers a connect middleware on the Vite dev server via `astro:server:setup`. Routes:

| Route | Method | Purpose |
|---|---|---|
| `/__edit/text` | POST | `{ route, before, after }` → string replace |
| `/__edit/media` | POST | multipart: file + `{ route, placeholderMarkup, alt, width, height, kind }` |

Added to `integrations: []` in `astro.config.mjs`. Because the hook is dev-only, its presence in
config is inert in a build.

### 2. Route → candidate files resolver

| Route | Candidate files |
|---|---|
| `/work/<slug>` | the matching `src/content/cases/*.tsx`, via `CASE_SLUGS` in `src/lib/site.ts` |
| `/work` | `src/pages/work/index.astro` |
| `/about`, `/contact`, `/404` | the matching `src/pages/*.astro` |
| `/` | `src/components/Terminal/*.tsx`, `src/lib/commands.ts` |

Uniqueness is required across the whole set, not per file. This handles the homepage, where a
single node's text could originate in any of several files, without needing per-node provenance.

### 3. Editor client (`src/components/dev/editor-client.ts`)

A plain TypeScript module, not a component. `DevPanel.tsx` calls `attachEditor()` from the
effect that currently sets `contentEditable` inline (`DevPanel.tsx:63-75`) and calls the returned
teardown on cleanup, so the existing dev-panel toggle stays the only entry point. Keeping it out
of the React tree means the DOM work is testable without mounting React and does not re-run on
every `DevPanel` render.

**It captures the node's original text on `focus`, not on `blur`.** That captured string is what
gets sent as `before` — reading the node at blur time would return the already-edited text and
the server would never find a match. This is the single most important detail in the client.

Also owns the media drop handlers (component 5).

- Applies `contentEditable` **only when edit mode is on**, and `removeAttribute`s it otherwise.
  This also fixes an existing dev-only React hydration warning: `DevPanel.tsx:66` currently
  writes `contenteditable="false"` onto nodes on mount, so the terminal hydrates against a DOM
  React did not render. Production is unaffected (verified: 0 occurrences in `dist/`).
- `paste` → plain text only. Pasting from a browser or Notion otherwise carries
  `<span style="…">` into the JSX source.
- `Enter` → commit and blur. `contentEditable` inserts `<div>`/`<br>` on Enter, which would
  corrupt the markup.
- `Escape` → revert the node to its pre-edit value.
- `blur` → save. Node shows saving / saved / failed.

### 4. `MediaFrame` gains video support

New props: `video?: string`, `poster?: string`. Renders
`<video autoplay loop muted playsinline poster={poster}>` — no controls, matching the "silent
looping prototype walkthrough" use case.

**Under `prefers-reduced-motion: reduce` it renders the poster as a still `<img>` and does not
autoplay**, consistent with how the rest of the site treats motion.

### 5. Media drop targets

In edit mode, `.media-slot` placeholders accept a dropped file.

- The **browser measures intrinsic dimensions before upload** (`naturalWidth`/`naturalHeight`, or
  `videoWidth`/`videoHeight`), so `width`/`height` are real and layout space is reserved before
  the file loads — no text jump.
- For video, the browser also **captures frame 0 to a canvas** and uploads it as the poster. No
  ffmpeg dependency.
- **Alt text is required for images** before the save is accepted. `eslint-plugin-jsx-a11y` would
  fail `npm run check` otherwise, and this is a portfolio for UX roles.

| Kind | Destination | Markup written |
|---|---|---|
| Image | `src/assets/<slug>-<n>.<ext>` | `import` at top of file + `<MediaFrame src={…} width height alt />` |
| Video | `public/media/<name>.<ext>` | `<MediaFrame video="/media/…" poster="/media/….png" width height />` |

Images are imported so Vite hashes, compresses and cache-busts them —
`MediaFrame.tsx:5-8` already documents this as the intended contract. Videos are multi-megabyte
binaries that gain nothing from the image pipeline, so they stay plain paths in `public/`.

## Data flow

```
edit node → blur
  → POST /__edit/text { route, before, after }
    → resolve candidate files from route
    → count occurrences of `before` across the set
       0 → 409 "stale, reload"      2+ → 409 "ambiguous, make it unique"
    → validate `after` (no { } < >)  → 400
    → write file → run Prettier on it
    → 200 → Vite HMR reloads → node shows "saved"
```

## Error handling

Every failure path **refuses rather than guesses**, and leaves the typed text on screen so
nothing is lost while it is corrected.

| Condition | Response |
|---|---|
| `before` matches 0 times | 409 — page is stale, reload |
| `before` matches 2+ times | 409 — ambiguous, make the text unique first |
| `after` contains `{`, `}`, `<`, `>` | 400 — would break the parse |
| Resolved path outside `src/` or `public/media/` | 403 |
| Image dropped without alt text | 400 |
| Write or Prettier failure | 500, original file content restored |

## Why this can't break the `.astro` whitespace work

The editor replaces text **inside** a node. The `&#32;` entities in `contact.astro` and
`404.astro` sit **between** elements and are never inside a replaced span. The post-write Prettier
run keeps every touched file in exactly the state Task 8 verified as stable, so `format:check`
cannot start failing because of an edit.

## Testing

The existing `scripts/smoke.mjs` runs against `astro preview` — production — where this code does
not exist. It structurally cannot cover the editor.

**New: `scripts/edit-smoke.mjs`**, run against `astro dev`:

1. Enable edit mode, change a case-study paragraph, blur.
2. Assert the **source file on disk** now contains the new text.
3. Assert the page re-renders with it after HMR.
4. Assert an ambiguous edit is refused and the file is unchanged.
5. Assert `{` is refused.
6. Drop a fixture image, assert the file lands in `src/assets/`, the `import` is written, and
   `npm run check` still passes.
7. `git checkout` the touched files to clean up.

**Proof the editor does not ship:**

- `grep -r "__edit" dist/` returns nothing
- 16-shot capture + `scripts/pixeldiff.mjs`: unchanged from current state (14 at 0, the two home
  images at their approved font values)
- `node scripts/smoke.mjs` still 20/20
- `npm run check` green

## Out of scope

Layout editing, font and colour editing beyond the existing `DevPanel` presets, undo beyond
git, multi-user or remote editing, and any production editing surface.

## Known caveat to document

Edits are **uncommitted working-tree changes** until committed. `git checkout`, `git stash` and
`git reset --hard` will discard them. Commit as you go.
