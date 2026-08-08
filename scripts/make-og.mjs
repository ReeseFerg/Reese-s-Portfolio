/**
 * Renders public/og.png — the 1200x630 card shown when the site is shared.
 * Uses the site's own tokens so the preview looks like the site.
 *
 *   node .context/make-og.mjs
 */
import { chromium } from 'playwright';

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; background: #000; color: #faf9f5;
    font-family: "JetBrains Mono", monospace;
    display: flex; align-items: center; justify-content: center;
  }
  .box {
    position: relative; width: 1000px; padding: 72px 64px;
    border: 1px solid rgba(217,119,87,0.55); border-radius: 14px; background: #0f0f0f;
  }
  .chip {
    position: absolute; top: 0; left: 44px; transform: translateY(-50%);
    padding: 0 16px; font-size: 20px; color: #d97757;
    background: linear-gradient(to bottom, #000 50%, #0f0f0f 50%);
  }
  h1 { font-size: 66px; font-weight: 700; line-height: 1.1; letter-spacing: -0.01em; }
  .accent { color: #d97757; }
  p { margin-top: 26px; font-size: 27px; line-height: 1.5; color: #dedad1; }
  .tools { margin-top: 44px; font-size: 21px; color: #8e8e8e; }
  .sep { color: #5a5a5a; padding: 0 8px; }
</style></head>
<body>
  <div class="box">
    <span class="chip">Reese's Portfolio</span>
    <h1>Reese is <span class="accent">a UX designer</span></h1>
    <p>Business graduate who designs with AI in the loop.<br>Less deck, more demo.</p>
    <p class="tools">Figma<span class="sep">·</span>Paper<span class="sep">·</span>Claude Code<span class="sep">·</span>Conductor<span class="sep">·</span>Framer<span class="sep">·</span>Linear</p>
  </div>
</body></html>`;

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.waitForTimeout(600); // let the webfont settle before capturing
await page.screenshot({ path: 'public/og.png' });
await browser.close();
console.log('wrote public/og.png');
