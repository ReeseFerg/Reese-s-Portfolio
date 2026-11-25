/**
 * Homepage pixel trail: a fixed full-viewport <canvas> where cells under the
 * cursor light up in the active accent colour and fade out. One canvas and a
 * rAF loop that only runs while cells are fading — not one DOM node per cell.
 *
 * Same lifecycle as `case-chrome.ts` (see its header for the why): module code
 * runs once per document, so all binding happens in an `astro:page-load`
 * listener and teardown on `astro:before-swap`, via one AbortController. The
 * canvas only exists on the homepage, so every other route's bind is a no-op.
 */

// Makes this a module so its top-level names don't collide with other scripts'.
export {};

/** Matches `--duration-slow` in tokens.css. */
const FADE_MS = 520;

let controller: AbortController | null = null;
let frame = 0;

function bind() {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas.pixel-trail');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  controller = new AbortController();
  const { signal } = controller;

  // `--accent` is an oklch() string, which older Safari can't parse as a canvas
  // fillStyle. Letting the browser resolve it through `color` yields rgb().
  canvas.style.color = 'var(--accent)';

  let pixelSize = 24;
  let width = 0;
  let height = 0;
  const lit = new Map<number, { col: number; row: number; at: number }>();

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pixelSize = window.innerWidth < 768 ? 16 : 24;
  };

  const draw = (now: number) => {
    frame = 0;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = getComputedStyle(canvas).color;
    for (const [key, cell] of lit) {
      const alpha = 1 - (now - cell.at) / FADE_MS;
      if (alpha <= 0) {
        lit.delete(key);
        continue;
      }
      ctx.globalAlpha = alpha;
      ctx.fillRect(cell.col * pixelSize, cell.row * pixelSize, pixelSize, pixelSize);
    }
    ctx.globalAlpha = 1;

    // Idle at rest: only schedule another frame while something is still fading.
    if (lit.size > 0) frame = requestAnimationFrame(draw);
  };

  const onMove = (e: PointerEvent) => {
    const col = Math.floor(e.clientX / pixelSize);
    const row = Math.floor(e.clientY / pixelSize);
    // Cell coordinates are bounded by the viewport, so this packing is collision-free.
    lit.set(row * 10000 + col, { col, row, at: performance.now() });
    if (!frame) frame = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true, signal });
  window.addEventListener('pointermove', onMove, { passive: true, signal });
}

function teardown() {
  controller?.abort();
  controller = null;
  cancelAnimationFrame(frame);
  frame = 0;
}

document.addEventListener('astro:page-load', bind);
document.addEventListener('astro:before-swap', teardown);
