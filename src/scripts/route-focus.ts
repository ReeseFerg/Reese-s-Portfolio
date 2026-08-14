/**
 * Moves focus to <main> after an in-app navigation — what `useRouteFocus`
 * used to do in `src/App.tsx`. `<ClientRouter />` already scrolls to top on
 * navigation, so this only needs to reproduce the focus half; the smooth
 * scroll-to-top is lost but the view transition covers it.
 *
 * Runs on every page (not just case studies), so it lives in its own script
 * loaded from BaseLayout rather than alongside case-chrome.ts.
 *
 * `navigated` is set on `astro:after-swap` — which only fires on an actual
 * client-side swap, never on the first load of a document — and read on the
 * following `astro:page-load`. That's how a first load or a fresh deep link
 * is told apart from real in-app navigation: on a first load, `page-load`
 * fires with `navigated` still false, so focus is left alone and the visitor
 * stays at the top of the document instead of being dropped into <main>.
 * The two listeners below are top-level and registered once, by design —
 * only the focus() call inside the page-load handler needs to happen again
 * per navigation, and it re-reads `navigated` fresh each time.
 */

let navigated = false;

document.addEventListener('astro:after-swap', () => {
  navigated = true;
});

document.addEventListener('astro:page-load', () => {
  if (!navigated) return;
  document.getElementById('main')?.focus({ preventScroll: true });
});
