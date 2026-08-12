# Reese's Portfolio

My UX portfolio. A terminal-styled homepage, a work index, and case studies.

Built with [Astro](https://astro.build) + React (one island, the terminal) + TypeScript,
styled with plain CSS and custom properties, and deployed as static files.

---

## Getting started

```bash
devbox shell      # gets you the right Node version, every time
npm install
npm run dev       # http://localhost:5173
```

Devbox pins Node 24 so the project still builds if you come back to it in a year
and your system Node has moved on. Without devbox, plain `npm install && npm run dev`
works too — you just have to supply Node 22+ yourself.

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built site locally, exactly as deployed (`http://localhost:4321`) |
| `npm run check` | Everything below, in one go — run before pushing |
| `npm run typecheck` | `astro check` |
| `npm run lint` | ESLint, including accessibility rules |
| `npm run lint:css` | Stylelint |
| `npm run format` | Prettier, writing fixes |

---

## How it's laid out

```
src/
  pages/                 one file per route — Astro renders each to real HTML at build time
    index.astro          the terminal homepage
    work/index.astro     the work index
    work/[slug].astro    case studies — getStaticPaths() over CASE_SLUGS
    about.astro, contact.astro, 404.astro
    sitemap.xml.ts, robots.txt.ts
  layouts/
    BaseLayout.astro     <head>/SEO tags, ClientRouter, stylesheet imports, page chrome
  components/
    SiteHeader.astro
    Terminal/            the homepage terminal — the site's only island (client:load)
    case/MediaFrame.tsx
    dev/DevPanel.tsx     localhost-only font and surface switcher (client:only)
  scripts/
    case-chrome.ts       TOC scroll-spy, reveal-on-scroll, read-progress bar
    route-focus.ts        focuses <main> after an in-app navigation
  lib/
    site.ts              every route and its title/description — the one list
    seo.ts               builds the meta tags, sitemap and robots.txt
    commands.ts          the terminal's slash commands
    themes.ts             the six tool accent colours
    useTypewriter.ts      the "Reese is …" cycle
    useReducedMotion.ts   respects the OS "reduce motion" setting
  content/cases/         the four case studies, as markup (React components, zero client JS)
  styles/                tokens, base, terminal, views, case, dev, responsive
  assets/                 case study screenshots go here (see src/assets/README.md)
public/                  files served as-is: resume.pdf, og.png, favicon.svg
```

**Styles are global CSS, not CSS Modules.** They were ported from the previous
single-file build unchanged, and several rules deliberately reach across
components (`body.routed .hero`, `html[data-type]`). Splitting them into modules
would have meant renaming every class for no real gain. `BaseLayout.astro` imports
them in a fixed order — self-hosted JetBrains Mono, then tokens, base, terminal,
views, case, dev, responsive last — and `tokens.css` holds the palette, type scale
and spacing; start there for any visual change.

**Stylelint owns CSS, Prettier owns everything else.** Prettier is set to ignore
`.css` so the two don't fight over the same files.

**Case studies ship zero client-side JavaScript.** `src/content/cases/*.tsx` are React
components, but they're rendered to plain HTML at build time and never hydrated — the
only script on a case page is `src/scripts/case-chrome.ts`, a small vanilla module for
the TOC scroll-spy and read-progress bar.

See `CLAUDE.md` for the architectural detail that matters for making changes safely —
in particular how scripts have to be written to survive Astro's view-transition swaps.

---

## Before it goes live

- **`public/resume.pdf` is a placeholder.** It exists so the Résumé links resolve
  instead of 404ing, and the page itself says so in large letters. Replace it with
  the real CV; nothing else needs changing.
- **`public/og.png` is generated, not designed.** It's the card people see when the
  site is shared. It matches the terminal look and is fine to ship, but if you want
  to art-direct it, edit the template in `scripts/make-og.mjs` and re-run it.
- **`SITE_URL` in `src/lib/site.ts` is a guess** (`https://reeseferguson.com`). Change
  it to the real domain — canonical URLs, the sitemap and every social tag are built
  from it, and they'll all point at the wrong host until you do.

The case studies are still full of `[TODO: …]` markers. Write the copy in
`CASE-STUDIES.md` first, then move it in — that doc explains why that order matters.

---

## Deploying

The build produces plain static files, so any host works. `vercel.json` already has
the right settings (`cleanUrls`, `trailingSlash: false`) — import the repo into
Vercel and it just works, with a preview URL per branch.

Each route is written to its own `index.html` at build time with its own `<title>`
and `og:` tags, because link scrapers read the HTML without running JavaScript. That
also means real URLs work on any static host without rewrite rules — `/work/index.html`
is genuinely there on disk. Old `#/work/…` links still redirect to the new paths.

---

## Design work

The `impeccable` design skill is wired into this project (`.impeccable/`). Useful
entry points:

- `/impeccable init` — writes `PRODUCT.md` by interviewing you about the product.
  Worth doing first; other commands read it.
- `/impeccable document` — writes `DESIGN.md` from the code as it stands, so later
  work preserves the existing look instead of replacing it.
- `/impeccable animate` — motion work.
- `/impeccable live` — pick elements in the browser and generate variants.

### Comparing a change against the current design

`scripts/` has the tooling used to verify this codebase against its previous
single-file version, and it works the same way for a redesign — screenshot every
route before and after, plus 20 behaviour checks. See `scripts/README.md`.
