/**
 * Writes public/resume.pdf as an obvious placeholder, so the Résumé link in the
 * header and on /contact resolves instead of 404ing during development.
 *
 * It says what it is on the page — if this ever reaches production by accident,
 * that's visible immediately rather than looking like a real, empty CV.
 */
import { chromium } from 'playwright';

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "JetBrains Mono", monospace; color: #111; padding: 90px 80px; }
  h1 { font-size: 30px; letter-spacing: -0.01em; }
  .tag { margin-top: 8px; font-size: 14px; color: #a33; }
  hr { margin: 28px 0; border: 0; border-top: 1px solid #ddd; }
  p { font-size: 14px; line-height: 1.8; max-width: 60ch; }
  code { background: #f2f2f2; padding: 1px 5px; border-radius: 3px; }
</style></head>
<body>
  <h1>Reese Ferguson — Résumé</h1>
  <p class="tag">PLACEHOLDER — this is not a real CV.</p>
  <hr>
  <p>
    This file exists so the Résumé link in the site header and on the contact page
    resolves during development instead of returning a 404.
  </p>
  <p>
    Replace it with the real CV at <code>public/resume.pdf</code> before the site
    goes live. Nothing else needs changing — both links already point here.
  </p>
</body></html>`;

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
await page.pdf({ path: 'public/resume.pdf', format: 'A4', printBackground: true });
await browser.close();
console.log('wrote public/resume.pdf');
