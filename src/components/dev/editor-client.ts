type SaveState = 'saving' | 'saved' | 'failed';

function setState(el: HTMLElement, state: SaveState | null, message?: string): void {
  el.classList.remove('is-saving', 'is-saved', 'is-failed');
  if (state) el.classList.add(`is-${state}`);
  if (message) el.title = message;
  else el.removeAttribute('title');
}

async function save(el: HTMLElement, before: string, after: string): Promise<void> {
  setState(el, 'saving');
  try {
    const res = await fetch('/__edit/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route: window.location.pathname, before, after }),
    });
    if (!res.ok) {
      const { error } = (await res.json()) as { error: string };
      setState(el, 'failed', error);
      console.warn('[dev-editor]', error);
      return;
    }
    setState(el, 'saved');
    window.setTimeout(() => setState(el, null), 1200);
  } catch (error) {
    const message = (error as Error).message;
    setState(el, 'failed', message);
    console.warn('[dev-editor]', message);
  }
}

/**
 * Makes the matched elements editable in place and writes changes back to source.
 *
 * The original text is captured on `focus`, not on `blur`. Reading the node at
 * blur time would return the already-edited text, the server would search the
 * file for a string that is no longer in it, and every save would fail with
 * "no longer in the source". This is the single most important detail here.
 *
 * Listeners are delegated on `document` and torn down through one
 * AbortController, matching the pattern in src/scripts/case-chrome.ts.
 */
export function attachEditor(selector: string): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const originals = new WeakMap<HTMLElement, string>();
  const els = [...document.querySelectorAll<HTMLElement>(selector)];

  for (const el of els) {
    el.contentEditable = 'true';
    el.classList.add('is-editable');
  }

  document.addEventListener(
    'focusin',
    (event) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(selector);
      if (el) originals.set(el, el.textContent ?? '');
    },
    { signal },
  );

  document.addEventListener(
    'focusout',
    (event) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(selector);
      if (!el) return;
      const before = originals.get(el);
      const after = el.textContent ?? '';
      if (before === undefined || before === after) return;
      void save(el, before, after);
    },
    { signal },
  );

  document.addEventListener(
    'keydown',
    (event) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(selector);
      if (!el) return;

      // contentEditable inserts <div> or <br> on Enter, which would be written
      // into the JSX source as markup. Commit instead.
      if (event.key === 'Enter') {
        event.preventDefault();
        el.blur();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        const before = originals.get(el);
        if (before !== undefined) el.textContent = before;
        setState(el, null);
        el.blur();
      }
    },
    { signal },
  );

  // Pasting from a browser or a notes app carries <span style="…"> with it,
  // which would land in the source. Force plain text, and collapse whitespace
  // so a multi-line paste can't introduce newlines mid-string.
  document.addEventListener(
    'paste',
    (event) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(selector);
      if (!el) return;
      event.preventDefault();
      const text = event.clipboardData?.getData('text/plain') ?? '';
      // execCommand is deprecated but is still the only way to insert at the
      // caret while keeping the browser's native undo stack intact. The
      // Selection/Range alternative works and isn't deprecated, but breaks
      // Cmd+Z — which matters more than the warning when drafting prose.
      document.execCommand('insertText', false, text.replace(/\s+/g, ' '));
    },
    { signal },
  );

  return () => {
    controller.abort();
    for (const el of els) {
      el.removeAttribute('contenteditable');
      el.classList.remove('is-editable', 'is-saving', 'is-saved', 'is-failed');
      el.removeAttribute('title');
    }
  };
}
