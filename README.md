# Reese's Portfolio

My UX portfolio. A terminal-styled homepage, a work index, and case studies.

Built with [Vite](https://vite.dev) + React + TypeScript, styled with plain CSS and
custom properties, and deployed as static files.

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
| `npm run preview` | Serve the built site locally, exactly as deployed |
| `npm run check` | Everything below, in one go — run before pushing |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint, including accessibility rules |
| `npm run lint:css` | Stylelint |
| `npm run format` | Prettier, writing fixes |

---

## How it's laid out

```
index.html              page shell — <head> and the mount point, nothing else
src/
  main.tsx              entry: mounts React, imports the stylesheets in order
  App.tsx               routes, per-page <title>/meta, focus and scroll on navigation
  lib/
    site.ts             every route and its title/description — the one list
    seo.ts              builds the meta tags, sitemap and robots.txt
    commands.ts         the terminal's slash commands
    themes.ts           the six tool accent colours
    useTypewriter.ts    the "Reese is …" cycle
    useReducedMotion.ts respects the OS "reduce motion" setting
  components/
    SiteHeader.tsx
    Terminal/           the homepage terminal — logos, output log, command input
    case/               MediaFrame, ReadProgress
    dev/DevPanel.tsx    localhost-only font and surface switcher
  routes/               Home, Work, About, Contact, CaseStudy, NotFound
  content/cases/        the four case studies, as markup
  styles/               tokens, base, terminal, views, case, dev, responsive
  assets/               case study screenshots go here (see src/assets/README.md)
public/                 files served as-is: resume.pdf, og.png, favicon.svg
```

**Styles are global CSS, not CSS Modules.** They were ported from the previous
single-file build unchanged, and several rules deliberately reach across
components (`body.routed .hero`, `html[data-type]`). Splitting them into modules
would have meant renaming every class for no real gain. `tokens.css` holds the
palette, type scale and spacing — start there for any visual change.

**Stylelint owns CSS, Prettier owns everything else.** Prettier is set to ignore
`.css` so the two don't fight over the same files.

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

The build produces plain static files, so any host works. Two free options:

**Vercel** — import the repo; `vercel.json` already has the settings. You get a
preview URL per branch, which is useful for looking at a design change before
merging it.

**GitHub Pages** — `.github/workflows/deploy.yml` builds and publishes on every push
to `dev`. Turn it on under Settings → Pages → Source: "GitHub Actions". Delete the
workflow if you go with Vercel.

Each route is written to its own `index.html` at build time with its own `<title>`
and `og:` tags, because link scrapers read the HTML without running JavaScript. That
also means real URLs work on any static host without rewrite rules — `/work/index.html`
is genuinely there on disk. Old `#/work/…` links still redirect to the new paths.

### `npm audit` reports a React Router advisory

It will, and it can't currently be cleared: every published version is flagged by
something. The one on the installed version concerns React Router's RSC mode, which
needs a server runtime and server actions. This site is static and has neither, so
it isn't reachable here. Worth re-checking when a clean version ships.

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
route before and after, plus 17 behaviour checks. See `scripts/README.md`.
