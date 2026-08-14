/**
 * Case-study chrome: TOC scroll-spy, reveal-on-scroll, delegated TOC click
 * handling, and the read-progress bar. Ported verbatim from
 * `src/routes/CaseStudy.tsx`'s `useCaseChrome` and
 * `src/components/case/ReadProgress.tsx` — this script is what's left once
 * the React that used to own those DOM writes is gone.
 *
 * Astro bundles this as an ES module, which executes exactly once per
 * document. `<ClientRouter />` never creates a new document — it swaps the
 * `<body>` in place — so a plain top-level binding here would run once on
 * whichever page happened to load the module first and then silently stop
 * working. Instead, binding happens inside an `astro:page-load` listener
 * (fires on the initial load *and* after every swap), and teardown happens
 * on `astro:before-swap` via one `AbortController` (for every
 * `addEventListener`) plus `observer.disconnect()`. Those two top-level
 * `document.addEventListener` calls below are meant to register once —
 * it's only the work inside `bind`/`teardown` that repeats per page.
 */

/** The chapter is "current" once its top has passed this far down the viewport. */
const READING_BAND = 140;

let controller: AbortController | null = null;
let observer: IntersectionObserver | null = null;

function bind() {
  const bar = document.getElementById('readBar');
  const root = document.querySelector<HTMLElement>('[data-case-root]');

  // No case root on this page (e.g. /work, /about): nothing to spy on or
  // reveal, and the read-progress bar — which the DOM swap may have carried
  // an inline width over on, on some browsers — should read empty.
  if (!root) {
    if (bar) bar.style.width = '0%';
    return;
  }

  controller = new AbortController();
  const { signal } = controller;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const chapters = [...root.querySelectorAll<HTMLElement>('.chapter')];
  const tocLinks = [...root.querySelectorAll<HTMLElement>('.toc-link')];

  const setActive = (id: string | null) => {
    tocLinks.forEach((l) => {
      const on = !!id && l.dataset.target === id;
      l.classList.toggle('is-active', on);
      if (on) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
  };

  setActive(chapters[0]?.id ?? null);

  let spyTicking = false;
  const updateSpy = () => {
    spyTicking = false;
    let current = chapters[0] ?? null;
    for (const c of chapters) {
      if (c.getBoundingClientRect().top <= READING_BAND) current = c;
    }
    setActive(current?.id ?? null);
  };

  const onSpyScroll = () => {
    if (spyTicking) return;
    spyTicking = true;
    requestAnimationFrame(updateSpy);
  };

  window.addEventListener('scroll', onSpyScroll, { passive: true, signal });
  window.addEventListener('resize', onSpyScroll, { passive: true, signal });

  // Reveal once, then stop watching. Skipped under reduced motion, which also
  // means the .reveal class (opacity: 0) is never applied in that case.
  if (!reduced && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          obs.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    root.querySelectorAll('.case-cover, .impact-row, .chapter, .next-case').forEach((el) => {
      el.classList.add('reveal');
      observer!.observe(el);
    });
  }

  // TOC entries are buttons rather than #hash anchors: an in-page hash would
  // conflict with ClientRouter's scroll restoration.
  const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';
  const onTocClick = (e: Event) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.toc-link, .toc-top');
    if (!btn || !root.contains(btn)) return;
    if (btn.dataset.target === 'top') return window.scrollTo({ top: 0, behavior });
    document
      .getElementById(btn.dataset.target ?? '')
      ?.scrollIntoView({ behavior, block: 'start' });
  };
  root.addEventListener('click', onTocClick, { signal });

  // Read progress — written straight to the DOM node rather than through
  // framework state, since this runs on every scroll frame.
  if (bar) {
    let progressTicking = false;
    const updateProgress = () => {
      progressTicking = false;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      bar.style.width = (pct * 100).toFixed(2) + '%';
    };
    const onProgressScroll = () => {
      if (progressTicking) return;
      progressTicking = true;
      if (reduced) updateProgress();
      else requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener('scroll', onProgressScroll, { passive: true, signal });
    window.addEventListener('resize', onProgressScroll, { passive: true, signal });
  }
}

function teardown() {
  controller?.abort();
  controller = null;
  observer?.disconnect();
  observer = null;
}

document.addEventListener('astro:page-load', bind);
document.addEventListener('astro:before-swap', teardown);
