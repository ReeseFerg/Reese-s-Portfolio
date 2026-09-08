import { useEffect, useState } from 'react';

/**
 * Local-only comparison panel. It only mounts under `import.meta.env.DEV`, so
 * unlike the old hostname check this is removed from the production bundle
 * rather than merely hidden in it.
 *
 * The candidate font families are injected on demand rather than linked in
 * <head>, so visitors only ever download JetBrains Mono. Once a preset wins,
 * hardcode it in tokens.css and delete this panel with the losing presets.
 */
const FONT_PRESETS: Record<string, string[]> = {
  mono: [], // the control — current design, no extra download
  serif: ['Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600'],
  grotesk: ['Inter:wght@400;500;600;700'],
  hybrid: ['Space+Grotesk:wght@400;500;600;700', 'Inter:wght@400;500;600;700'],
};

const EDITABLE = [
  '.about-copy, .project-row, .panel-heading, .flavor-line, .term-box-title, .phrase, .path-line',
  '.term-tab-name, .view-title, .view-lead, .wc-outcome, .about-lead, .about-copy2',
  '.case-title, .case-lead, .case-meta dd, .eyebrow, .stat-value, .stat-label',
  '.chapter h2, .chapter h3, .chapter p, .media figcaption, .callout p, .callout cite',
  '.quote-user p, .quote-user .attr, .pain-list li, .insight-card h3, .insight-card p',
  '.next-case-title, .next-case-desc, .case-closing',
].join(', ');

function loadFonts(preset: string) {
  for (const spec of FONT_PRESETS[preset]) {
    const href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
    // A module-scoped Set of "already fetched" specs used to dedupe this, but
    // the <link> it guards lives in <head>, which Astro replaces wholesale on
    // every view-transition swap — so the Set would go stale while the DOM
    // lost the link, and preset fonts would vanish after one navigation.
    // Checking the DOM directly stays correct across swaps.
    if (document.head.querySelector(`link[href="${href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.append(link);
  }
}

export default function DevPanel() {
  const [type, setType] = useState(() => localStorage.getItem('rf-type') ?? 'mono');
  const [surface, setSurface] = useState(
    () => localStorage.getItem('rf-media-surface') ?? 'dark',
  );
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadFonts(type);
    // "mono" matches no override, so it falls back to :root.
    document.documentElement.dataset.type = type;
    localStorage.setItem('rf-type', type);
  }, [type]);

  useEffect(() => {
    document.documentElement.dataset.mediaSurface = surface;
    localStorage.setItem('rf-media-surface', surface);
  }, [surface]);

  // Only touches the DOM while editing is on. The previous version set
  // contentEditable="false" on mount regardless, so the terminal hydrated
  // against attributes React had not rendered and warned about a mismatch on
  // every dev page load.
  //
  // Loaded through a DEV-guarded dynamic import rather than a static one.
  // Astro folds this component into Rollup's entry set whatever the guard says
  // (withastro/astro#8659), so a static import would carry the editor client
  // into dist/_astro/DevPanel.*.js — orphaned and never executed, but still
  // published. Vite replaces import.meta.env.DEV with false in a build, which
  // makes this branch dead code and drops the module entirely.
  useEffect(() => {
    if (!import.meta.env.DEV || !editing) return;

    let teardown: (() => void) | undefined;
    let cancelled = false;

    void import('./editor-client.ts').then(({ attachEditor }) => {
      if (cancelled) return;
      teardown = attachEditor(EDITABLE);
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [editing]);

  return (
    <div className="dev-panel">
      <div className="dev-row">
        <span className="dev-row-label">type</span>
        {Object.keys(FONT_PRESETS).map((k) => (
          <button
            key={k}
            type="button"
            className={'dev-chip' + (type === k ? ' is-on' : '')}
            onClick={() => setType(k)}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="dev-row">
        <span className="dev-row-label">panels</span>
        {['dark', 'warm'].map((s) => (
          <button
            key={s}
            type="button"
            className={'dev-chip' + (surface === s ? ' is-on' : '')}
            onClick={() => setSurface(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="dev-row">
        <button
          id="editModeToggle"
          type="button"
          className={editing ? 'is-on' : ''}
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? '✓ editing — click to stop' : '✎ edit text'}
        </button>
      </div>
    </div>
  );
}
