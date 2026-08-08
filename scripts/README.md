# scripts/

Verification and asset tooling. None of it runs during `npm run dev` or `npm run build` —
these are things you reach for when checking a design change or regenerating an asset.

They need Playwright, which isn't a project dependency because it would add a browser
download to every fresh `npm install`:

```bash
npm i --no-save playwright && npx playwright install chromium
```

| Script | What it does |
|---|---|
| `capture.mjs <url> <outDir>` | Screenshots all 8 routes at desktop and mobile |
| `smoke.mjs <url>` | 17 behaviour checks — typewriter, themes, commands, keyboard nav, routing, TOC scroll-spy |
| `make-og.mjs` | Regenerates `public/og.png`, the social preview card |
| `make-resume-placeholder.mjs` | Regenerates the placeholder `public/resume.pdf` |

## Checking a redesign against what's there now

```bash
npm run build && npx vite preview --port 4322 &
node scripts/capture.mjs http://localhost:4322 before   # current design
# ...make changes, rebuild...
node scripts/capture.mjs http://localhost:4322 after
```

Then compare the two folders. This is how the React port was verified against the
single-file build it replaced: 18 differing pixels out of 48.5M, all antialiasing.
