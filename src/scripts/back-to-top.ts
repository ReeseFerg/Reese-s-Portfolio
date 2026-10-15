/**
 * Back-to-top button (RW-133). Reveals `.to-top` (rendered in BaseLayout,
 * next to `.read-progress`) once the page has scrolled past a threshold, and
 * scrolls to top on click. Runs on every route, like route-focus.ts.
 *
 * Follows the same astro:page-load / astro:before-swap + single
 * AbortController pattern as case-chrome.ts and route-focus.ts — see
 * CLAUDE.md, "View transitions: scripts run once per document".
 */

const THRESHOLD = 600;

let controller: AbortController | null = null;

function bind() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  controller = new AbortController();
  const { signal } = controller;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let ticking = false;
  const update = () => {
    ticking = false;
    btn.classList.toggle('is-visible', window.scrollY > THRESHOLD);
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    if (reduced) update();
    else requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true, signal });
  window.addEventListener('resize', onScroll, { passive: true, signal });

  btn.addEventListener(
    'click',
    () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }),
    { signal },
  );
}

function teardown() {
  controller?.abort();
  controller = null;
}

document.addEventListener('astro:page-load', bind);
document.addEventListener('astro:before-swap', teardown);

// A file with no top-level import/export is a TS "global script", so its
// declarations (bind/teardown/controller) would otherwise collide with
// case-chrome.ts's identically-named ones. This opts back-to-top.ts into
// module scope without changing anything Astro bundles at runtime.
export {};
