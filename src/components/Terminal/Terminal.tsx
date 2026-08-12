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
// wiping the inline `--accent` style set below. Mirroring it to localStorage
// lets BaseLayout.astro's is:inline restore script put it back on
// astro:after-swap (and on first paint) before the swap can flicker.
const ACCENT_STORAGE_KEY = 'rf-accent';

const PROJECT_ROWS = [
  { cmd: '/north-coast-bjj', name: 'north-coast-bjj', desc: '— client project, live' },
  { cmd: '/databrew', name: 'databrew', desc: '— extension, shipping' },
  { cmd: '/savr-app', name: 'savr-app', desc: '— course project, 2026' },
  { cmd: '/project-cadence', name: 'project-cadence', desc: '— in progress' },
];

export default function Terminal() {
  const reduced = useReducedMotion();
  const [theme, setTheme] = useState<ThemeName>('claude');
  const [lines, setLines] = useState<LogLine[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  const phrase = useTypewriter(PHRASES, reduced);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', THEMES[theme]);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, THEMES[theme]);
    } catch {
      // Storage can be unavailable (private mode, quota) — the re-theme still
      // works for the current page, it just won't survive a swap or reload.
    }
  }, [theme]);

  const addLine = useCallback((kind: LogLine['kind'], marker: string, text: string) => {
    setLines((prev) =>
      [...prev, { id: nextId.current++, kind, marker, text }].slice(-MAX_LINES),
    );
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
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelected((s) => (s + 1) % ASK_OPTIONS.length);
          return;
        }
        if (e.key === 'ArrowUp') {
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
    // Tearing down on astro:before-swap (and removing that listener here too,
    // so re-running this effect for a `selected` change doesn't stack copies)
    // closes that leak.
    const detach = () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('astro:before-swap', detach);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('astro:before-swap', detach);
    return detach;
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
            Reese is <span className="phrase">{phrase}</span>
            &nbsp;
            <span className="cursor" />
          </p>

          <PixelLogos active={theme} />

          <div className="term-left-info">
            <p className="tools-line">
              {TOOLS.map(({ name, label }, i) => (
                <span key={name}>
                  {i > 0 && <span className="sep">·</span>}
                  <button
                    className={'tool' + (theme === name ? ' is-active' : '')}
                    onClick={() => setTheme(name)}
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
        <span className="spark">✳</span> Open to opportunities ·{' '}
        <span
          className="slash"
          role="button"
          tabIndex={0}
          onClick={() => execute('/contact')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              execute('/contact');
            }
          }}
        >
          /contact
        </span>{' '}
        to get in touch
      </p>

      <div className="ask-box" id="askBox">
        <span className="ask-title">Where would you like to go?</span>
        {ASK_OPTIONS.map((opt, i) => (
          <button
            key={opt.cmd}
            className={'ask-option' + (selected === i ? ' is-selected' : '')}
            onMouseEnter={() => setSelected(i)}
            onClick={() => execute(opt.cmd)}
          >
            <span className="ask-caret">❯</span>
            <span className="ask-label">{opt.label}</span>
            <span className="ask-desc">{opt.desc}</span>
          </button>
        ))}
      </div>

      <OutputLog lines={lines} reduced={reduced} />

      <CommandInput ref={inputRef} onExecute={execute} />

      <p className="shortcuts-hint">? for shortcuts</p>
    </section>
  );
}
