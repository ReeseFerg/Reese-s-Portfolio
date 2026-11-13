/**
 * Homepage snapshot-card cover video: plays only while the card is hovered
 * or focused, idling on its poster frame otherwise (see `SnapshotCard.astro`).
 *
 * Astro bundles this as an ES module, which executes exactly once per
 * document. `<ClientRouter />` never creates a new document — it swaps the
 * `<body>` in place — so a plain top-level binding here would run once on
 * whichever page happened to load the module first and then silently stop
 * working. Instead, binding happens inside an `astro:page-load` listener
 * (fires on the initial load *and* after every swap), and teardown happens
 * on `astro:before-swap` via one `AbortController` for every
 * `addEventListener`. The two top-level `document.addEventListener` calls
 * below are meant to register once — it's only the work inside
 * `bind`/`teardown` that repeats per page.
 */

let controller: AbortController | null = null;

function bind() {
  // Under reduced motion, `.sc-media video` is `display: none` (views.css)
  // and the still image shows instead — nothing to play, so skip binding
  // entirely (mirrors case-chrome's JS-level skip for `.reveal`).
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const videos = document.querySelectorAll<HTMLVideoElement>('.sc-media-video');
  if (videos.length === 0) return;

  controller = new AbortController();
  const { signal } = controller;

  videos.forEach((video) => {
    const card = video.closest<HTMLElement>('.snapshot-card');
    if (!card) return;

    const play = () => {
      video.play().catch(() => {});
    };
    const stop = () => {
      video.pause();
      video.currentTime = 0;
    };

    card.addEventListener('pointerenter', play, { signal });
    card.addEventListener('pointerleave', stop, { signal });
    card.addEventListener('focusin', play, { signal });
    card.addEventListener('focusout', stop, { signal });
  });
}

function teardown() {
  controller?.abort();
  controller = null;
}

document.addEventListener('astro:page-load', bind);
document.addEventListener('astro:before-swap', teardown);

export {};
