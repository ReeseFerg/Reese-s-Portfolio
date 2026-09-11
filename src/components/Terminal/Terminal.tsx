import { useCallback, useEffect, useRef, useState } from 'react';
import { navigate } from 'astro:transitions/client';

import { COMMANDS, SHORTCUTS_TEXT, ASK_OPTIONS } from '../../lib/commands';
import { THEMES, TOOLS, type ThemeName } from '../../lib/themes';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { useTypewriter } from '../../lib/useTypewriter';
import PixelLogos from './PixelLogos';
import OutputLog, { type LogLine } from './OutputLog';
import CommandInput from './CommandInput';

const PHRASES = ['a UX designer', 'a business graduate', 'futureproof'];
const MAX_LINES = 8;
// Astro's default swap resyncs <html>'s attributes from the incoming document,
// wiping the inline `--accent` style set below. Mirroring it to
// sessionStorage lets BaseLayout.astro's is:inline script restore it on
// astro:after-swap. sessionStorage (not localStorage): a hard reload must
// still reset to the default accent, matching the pre-migration site — the
// restore script only ever reads this on a swap, never on a real load.
const ACCENT_STORAGE_KEY = 'rf-accent';

const PROJECT_ROWS = [
  { cmd: '/north-coast-bjj', name: 'north-coast-bjj', desc: '— client project, live' },
  { cmd: '/databrew', name: 'databrew', desc: '— extension, shipping' },
  { cmd: '/savr-app', name: 'savr-app', desc: '— course project, 2026' },
  { cmd: '/project-cadence', name: 'project-cadence', desc: '— in progress' },
];

export default function Terminal() {
  const reduced = useReducedMotion();
  // No tool is selected by default — the accent falls back to the Tron-orange
  // token in tokens.css. Hovering or focusing a tool previews its brand colour
  // and mascot; clicking pins it. Only the pinned choice persists across a
  // view-transition swap (see the two effects below).
  const [pinned, setPinned] = useState<ThemeName | null>(null);
  const [hovered, setHovered] = useState<ThemeName | null>(null);
  const activeTheme = hovered ?? pinned;
  const [lines, setLines] = useState<LogLine[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  const phrase = useTypewriter(PHRASES, reduced);

  // Effective accent: a hover/focus preview, else the pinned tool, else the
  // Tron-orange token (remove the inline override so tokens.css wins).
  useEffect(() => {
    const root = document.documentElement.style;
    if (activeTheme) root.setProperty('--accent', THEMES[activeTheme]);
    else root.removeProperty('--accent');
  }, [activeTheme]);

  // Only the pinned choice is mirrored to sessionStorage, so a transient hover
  // preview never persists across a view-transition swap (BaseLayout.astro's
  // is:inline script restores from this key on astro:after-swap). Clearing it
  // when nothing is pinned lets the default Tron orange stand after a swap.
  useEffect(() => {
    try {
      if (pinned) sessionStorage.setItem(ACCENT_STORAGE_KEY, THEMES[pinned]);
      else sessionStorage.removeItem(ACCENT_STORAGE_KEY);
    } catch {
      // Storage can be unavailable (private mode, quota) — the re-theme still
      // works for the current page, it just won't survive a swap or reload.
    }
  }, [pinned]);

  const addLine = useCallback((kind: LogLine['kind'], marker: string, text: string) => {
    const id = nextId.current++;
    setLines((prev) => [...prev, { id, kind, marker, text }].slice(-MAX_LINES));
  }, []);

  const execute = useCallback(
    (raw: string) => {
      const v = raw.trim().replace(/\s+/g, ' ');
      if (!v) return;
      addLine('out-echo', '❯', v);

      if (v === '?') {
        addLine('out-resp', '⏺', SHORTCUTS_TEXT);
        return;
      }

      const match = COMMANDS.find((c) => c.cmd.toLowerCase() === v.toLowerCase());
      if (match) {
        addLine('out-resp', '⏺', match.out);
        navigate(match.route);
      } else if (v.startsWith('/')) {
        addLine('out-err', '✗', 'command not found: ' + v + ' · try ? for shortcuts');
      } else {
        addLine('out-err', '✗', 'not a command: ' + v + ' · commands start with /');
      }
    },
    [addLine],
  );

  // Arrow keys move through the question block, number keys pick an option, and
  // any other printable key drops focus into the input so you can just start
  // typing — the same affordances the real Claude Code prompt has.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const active = document.activeElement;
      if (active instanceof HTMLElement && active.isContentEditable) return;

      const input = inputRef.current;
      const inInput = active === input;
      const suggestOpen = !!document.querySelector('.suggest.is-open');

      if (!inInput || (input?.value === '' && !suggestOpen)) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          setSelected((s) => (s + 1) % ASK_OPTIONS.length);
          return;
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          setSelected((s) => (s - 1 + ASK_OPTIONS.length) % ASK_OPTIONS.length);
          return;
        }
      }

      if (!inInput) {
        if (e.key === 'Enter') {
          e.preventDefault();
          execute(ASK_OPTIONS[selected].cmd);
          return;
        }
        const n = Number.parseInt(e.key, 10);
        if (n >= 1 && n <= ASK_OPTIONS.length) {
          e.preventDefault();
          execute(ASK_OPTIONS[n - 1].cmd);
          return;
        }
        if (e.key.length === 1) input?.focus();
      }
    };

    // Astro doesn't unmount this component on a view-transition swap — it just
    // discards the old DOM node, so this effect's own cleanup never runs and
    // the listener would otherwise survive on `document` across navigations.
    // Aborting on astro:before-swap (also wired through `signal`, so it only
    // ever fires once) closes that gap the same way case-chrome.ts's
    // controller-per-bind teardown does for the case-study chrome.
    const controller = new AbortController();
    const { signal } = controller;
    document.addEventListener('keydown', onKeyDown, { signal });
    document.addEventListener('astro:before-swap', () => controller.abort(), { signal });
    return () => controller.abort();
  }, [execute, selected]);

  return (
    <section className="hero">
      <p className="term-line">Last login: Tue Jul 22 20:44:24 on console</p>
      <p className="term-line">
        reese@portfolio ~ % <span className="cmd">claude</span>
      </p>

      <div className="term-box">
        <span className="term-box-title">Reese&apos;s Portfolio v0.0.2</span>

        <div className="term-left">
          <p className="welcome">
            {/* The phrase cycles; hidden sizers (one per full "Reese is …"
                line) reserve the WIDEST and TALLEST option so the box never
                reflows as the typewriter types or swaps phrases — on desktop
                (one line) and on phones (wrapped). Live text overlays them. */}
            <span className="line-wrap">
              {PHRASES.map((p) => (
                <span key={p} className="line-sizer" aria-hidden="true">
                  Reese is {p}
                </span>
              ))}
              <span className="line-live">
                Reese is <span className="phrase">{phrase}</span>
                <span className="cursor" />
              </span>
            </span>
          </p>

          <PixelLogos active={activeTheme ?? 'claude'} />

          <div className="term-left-info">
            <p className="tools-line">
              {TOOLS.map(({ name, label }, i) => (
                <span key={name}>
                  {i > 0 && <span className="sep">·</span>}
                  <button
                    className={'tool' + (pinned === name ? ' is-active' : '')}
                    onMouseEnter={() => setHovered(name)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(name)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setPinned(name)}
                  >
                    {label}
                  </button>
                </span>
              ))}
            </p>
            <p className="path-line">~/reese/portfolio</p>
          </div>
        </div>

        <div className="term-divider" />

        <div className="term-right">
          <div>
            <h2 className="panel-heading">About me</h2>
            <p className="about-copy">
              I&apos;m Reese — a UX designer and business graduate who designs with AI in the
              loop. I shape interfaces in Figma and Paper, pressure-test them with real flows,
              then ship them with Claude Code. Less deck, more demo.
            </p>
          </div>
          <div className="h-rule" />
          <div>
            <h2 className="panel-heading">Recent projects</h2>
            {PROJECT_ROWS.map(({ cmd, name, desc }) => (
              <button key={cmd} className="project-row" onClick={() => execute(cmd)}>
                {name} <span className="desc">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="flavor-line">
        <span className="spark">✳</span> Open to opportunities — pick a section below, or type a{' '}
        <span className="slash">/command</span> to look around.
      </p>

      <nav className="term-tabs" aria-label="Sections" id="askBox">
        {ASK_OPTIONS.map((opt, i) => (
          <button
            key={opt.cmd}
            className={'term-tab' + (selected === i ? ' is-selected' : '')}
            aria-current={selected === i ? 'true' : undefined}
            onMouseEnter={() => setSelected(i)}
            onClick={() => execute(opt.cmd)}
          >
            <span className="term-tab-caret">❯</span>
            <span className="term-tab-name">[ {opt.name} ]</span>
          </button>
        ))}
      </nav>

      <OutputLog lines={lines} reduced={reduced} />

      <CommandInput ref={inputRef} onExecute={execute} />

      <p className="shortcuts-hint">? for shortcuts</p>
    </section>
  );
}
