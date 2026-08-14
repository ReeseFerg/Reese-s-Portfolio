# scripts/

Verification and asset tooling. None of it runs during `npm run dev` or `npm run build` —
these are things you reach for when checking a design change or regenerating an asset.

They need Playwright, `pixelmatch` and `pngjs`, none of which are project dependencies
because they'd add a browser download to every fresh `npm install`. Install all three in
one command — `npm i --no-save <pkg>` prunes any previously `--no-save`-installed
packages, so installing them separately leaves only the last one in place:

```bash
npm i --no-save playwright pixelmatch pngjs && npx playwright install chromium
```

| Script | What it does |
|---|---|
| `capture.mjs <url> <outDir>` | Screenshots all 8 routes at desktop and mobile |
| `pixeldiff.mjs <beforeDir> <afterDir> [name...]` | Diffs two `capture.mjs` output dirs pixel-by-pixel; reports counts, and for anything non-zero, the bounding box and y-bands of the differing rows |
| `smoke.mjs <url>` | 20 behaviour checks — typewriter, themes, commands, keyboard nav, routing, TOC scroll-spy (including across repeated client-side navigation), `--accent` surviving a swap, island containment |
| `make-og.mjs` | Regenerates `public/og.png`, the social preview card |
| `make-resume-placeholder.mjs` | Regenerates the placeholder `public/resume.pdf` |

## Checking a redesign against what's there now

Serve with `astro preview`, not `vite preview` — the Vite dev/preview server doesn't
honour this project's `trailingSlash: 'never'` clean-URL resolution and silently falls
through to the home shell on other routes, which reads as every route being identical
instead of as a server misconfiguration.

```bash
npm run build && npx astro preview --port 4321 &
node scripts/capture.mjs http://localhost:4321 before   # current design
# ...make changes, rebuild...
node scripts/capture.mjs http://localhost:4321 after
node scripts/pixeldiff.mjs before after
```

This is how the Astro port was verified against the build it replaced: 14 of 16
screenshots are pixel-identical. The two homepage shots (desktop and mobile) differ by
~0.1–0.3% of their pixels, all sub-pixel antialiasing from self-hosting JetBrains Mono
instead of loading it from Google Fonts — reviewed and accepted, not a regression.
