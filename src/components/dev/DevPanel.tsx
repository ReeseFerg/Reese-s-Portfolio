import { useEffect, useState } from 'react';

/**
 * Local-only comparison panel. It only mounts under `import.meta.env.DEV`, so
 * unlike the old hostname check this is removed from the production bundle
 * rather than merely hidden in it.
 */
const EDITABLE = [
  '.about-copy, .project-row, .panel-heading, .flavor-line, .term-box-title, .phrase, .path-line',
  '.term-tab-name, .view-title, .view-lead, .about-lead, .about-copy2',
  '.sc-title, .sc-blurb, .sc-stat-value, .sc-stat-label',
  '.case-title, .case-lead, .case-meta dd, .eyebrow, .stat-value, .stat-label',
  '.chapter h2, .chapter h3, .chapter p, .media figcaption, .callout p, .callout cite',
  '.quote-user p, .quote-user .attr, .pain-list li, .insight-card h3, .insight-card p',
  '.next-case-title, .next-case-desc, .case-closing',
].join(', ');

export default function DevPanel() {
  const [surface, setSurface] = useState(
    () => localStorage.getItem('rf-media-surface') ?? 'dark',
  );
  const [editing, setEditing] = useState(false);

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
