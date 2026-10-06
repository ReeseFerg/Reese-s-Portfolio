/**
 * Mobile hamburger menu: opens/closes the dropdown panel (#site-menu) below
 * 768px. Above that the panel is the inline connected bar and the toggle is
 * hidden (CSS), so these handlers are harmless — the toggle button can't be
 * clicked and nothing reads `data-menu-open` at desktop widths.
 *
 * Same view-transition shape as case-chrome.ts / route-focus.ts (see CLAUDE.md
 * "View transitions: scripts run once per document"). `<ClientRouter />` swaps
 * the <body> in place rather than creating a new document, so a plain top-level
 * binding would run once and then silently stop. Binding happens inside an
 * `astro:page-load` listener (initial load *and* every swap) with teardown on
 * `astro:before-swap` via one AbortController. The body swap also means menu
 * state resets to closed on every navigation for free — bind just starts
 * closed, so there's nothing to reset by hand.
 */

let controller: AbortController | null = null;

function bind() {
  const header = document.querySelector<HTMLElement>('.site-header');
  const toggle = header?.querySelector<HTMLButtonElement>('.nav-toggle');
  const menu = header?.querySelector<HTMLElement>('#site-menu');
  if (!header || !toggle || !menu) return;

  controller = new AbortController();
  const { signal } = controller;

  const isOpen = () => header.hasAttribute('data-menu-open');

  const setOpen = (open: boolean) => {
    header.toggleAttribute('data-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  const close = (returnFocus = false) => {
    setOpen(false);
    if (returnFocus) toggle.focus();
  };

  toggle.addEventListener(
    'click',
    () => {
      setOpen(!isOpen());
    },
    { signal },
  );

  // Tapping a link inside the panel navigates (or opens the CV in a new tab) —
  // either way the menu should close behind it.
  menu.addEventListener(
    'click',
    (e) => {
      if ((e.target as HTMLElement).closest('a')) close();
    },
    { signal },
  );

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && isOpen()) close(true);
    },
    { signal },
  );

  // Click anywhere outside the header while open → close.
  document.addEventListener(
    'click',
    (e) => {
      if (isOpen() && !header.contains(e.target as Node)) close();
    },
    { signal },
  );
}

function teardown() {
  controller?.abort();
  controller = null;
}

document.addEventListener('astro:page-load', bind);
document.addEventListener('astro:before-swap', teardown);

// Module scope: without an import/export these top-level names would land in
// the shared global scope that astro check type-checks scripts in, colliding
// with case-chrome.ts's identically-named `controller`/`bind`/`teardown`.
export {};
