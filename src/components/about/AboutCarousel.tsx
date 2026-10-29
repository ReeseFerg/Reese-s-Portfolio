import * as React from 'react';

import { type LandPalette, usePlaceholderImages } from './placeholder-art';

/*
 * Card Deck Carousel — photos stacked like a loose deck of prints. Throw the
 * top card in any direction (drag and let go) and it flies off, then slides
 * back in at the bottom of the pile; the next one is already waiting. The
 * buttons, arrow keys and autoplay do the same throw; "previous" pulls the
 * last card back on top.
 *
 * Slides without an `image` get a painted landscape, so it works with no
 * assets at all.
 */

export type Slide = {
  image?: string;
  title?: string;
  caption?: string;
  /** Body paragraphs shown below the title and pagination count. */
  paragraphs?: string[];
  alt?: string;
  /** Palette and seed of the painted landscape used when `image` is empty. */
  palette?: LandPalette;
  seed?: number;
};

export type CardDeckCarouselProps = {
  slides?: Slide[];
  /** Any CSS length. Default 100svh. */
  height?: number | string;
  /** Width of a card, any CSS length. */
  cardWidth?: string;
  /** CSS aspect-ratio of a card. */
  aspect?: string;
  /** How messy the pile is: the largest tilt in degrees of the cards behind. */
  scatter?: number;
  /** ms per card; 0 turns autoplay off. It waits while someone is interacting. */
  autoplay?: number;
  background?: string;
  ink?: string;
  onChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
};

// #region logic
export function wrap(i: number, n: number): number {
  return n ? ((i % n) + n) % n : 0;
}

/** Resting pose of a card `depth` places down the pile. Only the top four show. */
export function deckPose(depth: number, tilt: number, reduce = false) {
  const d = Math.min(depth, 3);
  return {
    y: d ? -d * 16 : 0,
    scale: 1 - d * 0.055,
    rot: depth === 0 || reduce ? 0 : tilt,
    opacity: depth > 3 ? 0 : 1,
    shade: 1 - d * 0.07,
  };
}

/** A stable, slightly random tilt per card, in [-max, max] degrees. */
export function tiltFor(i: number, max: number): number {
  const u = (((i + 1) * 2654435761) >>> 0) / 4294967296;
  return (u * 2 - 1) * max;
}

/** Did the drag end as a throw? dx in px, vx in px/ms, w = card width. */
export function isThrow(dx: number, vx: number, w: number): boolean {
  return Math.abs(dx) > w * 0.28 || (Math.abs(vx) > 0.55 && Math.abs(dx) > 24);
}

export function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n);
}
// #endregion logic

const DEFAULT_SLIDES: Slide[] = [
  {
    title: 'First Light',
    caption: 'Haze lifting off the eastern ridges.',
    palette: 'dawn',
    seed: 3,
  },
  {
    title: 'High Pass',
    caption: 'Cold air, clear to the far range.',
    palette: 'alpine',
    seed: 8,
  },
  {
    title: 'Ember Hour',
    caption: 'The last of the sun on the valley floor.',
    palette: 'dusk',
    seed: 14,
  },
  {
    title: 'Still Valley',
    caption: 'Morning mist that never quite lifts.',
    palette: 'mist',
    seed: 21,
  },
  { title: 'Rose Ridge', caption: 'Five ridges, one long exhale.', palette: 'dawn', seed: 34 },
  {
    title: 'Blue Hour',
    caption: 'Pines going dark against the snow.',
    palette: 'alpine',
    seed: 55,
  },
];

const CD_CSS = [
  '.cd-root{position:relative;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(28px,5vh,52px);overflow:hidden;background:var(--cd-bg);color:var(--cd-ink);outline:none;padding:24px 16px;box-sizing:border-box}',
  '.cd-root:focus-visible{box-shadow:inset 0 0 0 2px var(--cd-ink)}',
  '.cd-row{display:flex;align-items:center;justify-content:center;gap:clamp(12px,2.5vw,28px)}',
  '.cd-peek{appearance:none;border:0;padding:0;background:none;cursor:pointer;flex-shrink:0;width:calc(var(--cd-w) * .5);aspect-ratio:var(--cd-aspect);border-radius:14px;overflow:hidden;opacity:1;filter:none;transition:opacity .3s ease,filter .3s ease}',
  '.cd-peek:hover,.cd-peek:focus-visible{opacity:.55;filter:brightness(.65)}',
  '.cd-peek:focus-visible{outline:2px solid var(--cd-ink);outline-offset:2px}',
  '.cd-peek img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;user-select:none}',
  '.cd-deck{position:relative;width:var(--cd-w);aspect-ratio:var(--cd-aspect);max-height:calc(var(--cd-h) * .62);max-width:calc(var(--cd-h) * .62 * var(--cd-ar));touch-action:pan-y;flex-shrink:0}',
  '.cd-card{position:absolute;inset:0;border-radius:18px;overflow:hidden;background:#d9d5cc;box-shadow:0 1px 2px rgba(0,0,0,.08),0 30px 60px -30px rgba(0,0,0,.45);transition:transform .6s cubic-bezier(.2,.8,.2,1),opacity .4s ease,filter .4s ease;will-change:transform}',
  ".cd-card[data-top='1']{cursor:grab}",
  ".cd-card[data-drag='1']{cursor:grabbing;transition:none}",
  ".cd-card[data-fly='1']{transition:transform .45s cubic-bezier(.3,.5,.3,1),opacity .45s ease}",
  ".cd-card[data-snap='1']{transition:none}",
  '.cd-card img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block;pointer-events:none;user-select:none}',
  '.cd-meta{display:flex;align-items:flex-start;justify-content:space-between;gap:clamp(16px,3vw,32px);width:min(640px,100%)}',
  '.cd-meta .cd-btn{margin-top:2px}',
  '.cd-center{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:6px}',
  '.cd-cap{min-width:0;max-width:100%;overflow:hidden;text-align:center;padding-bottom:.2em}',
  '.cd-cap>*{display:block;animation:cd-in .6s cubic-bezier(.2,.8,.2,1) both}',
  '.cd-title{font:600 clamp(18px,2.2vw,24px)/1.15 var(--cd-font-title);letter-spacing:-.01em}',
  '.cd-sub{margin-top:4px;font:400 13px/1.4 var(--cd-font-sub);color:var(--cd-muted);animation-delay:.05s}',
  '.cd-count{font:500 12px/1 var(--cd-font-count);letter-spacing:.14em;color:var(--cd-muted);text-align:center}',
  '.cd-count b{color:var(--cd-ink);font-weight:500}',
  '.cd-text{display:flex;flex-direction:column;gap:10px;max-width:480px;margin-top:4px}',
  '.cd-text p{font:400 14px/1.375 var(--cd-font-sub);color:var(--cd-text)}',
  '.cd-btn{appearance:none;border:1px solid var(--cd-line);background:transparent;color:inherit;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;cursor:pointer;flex:none;transition:background .2s ease,color .2s ease}',
  '.cd-btn:hover{background:var(--cd-ink);color:var(--cd-bg)}',
  '.cd-btn:focus-visible{outline:2px solid var(--cd-ink);outline-offset:2px}',
  '.cd-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
  '@keyframes cd-in{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}',
  "@media (prefers-reduced-motion:reduce){.cd-card,.cd-card[data-fly='1']{transition:opacity .3s ease}.cd-cap>*{animation:none}}",
  // On phones the flanking peeks have no room and get clipped by cd-root's
  // overflow:hidden, so drop them — the deck, arrows and drag still work.
  '@media (max-width:600px){.cd-peek{display:none}}',
].join('\n');

type Override = { i: number; x: number; y: number; r: number; mode: 'drag' | 'fly' | 'snap' };

export default function AboutCarousel({
  slides = DEFAULT_SLIDES,
  height = '100svh',
  cardWidth = 'min(78vw, 440px)',
  aspect = '4 / 5',
  scatter = 6,
  autoplay = 4200,
  background = 'transparent',
  ink = 'var(--text)',
  onChange,
  className,
  style,
  ariaLabel = 'Image carousel',
}: CardDeckCarouselProps) {
  const n = slides.length;
  const srcs = usePlaceholderImages(slides);
  const [top, setTop] = React.useState(0);
  const [over, setOver] = React.useState(null as Override | null);
  const rootRef = React.useRef(null as HTMLDivElement | null);
  const deckRef = React.useRef(null as HTMLDivElement | null);
  const busy = React.useRef(false);
  const lastTouch = React.useRef(0);
  const topRef = React.useRef(0);
  React.useEffect(() => {
    topRef.current = top;
  }, [top]);
  // Detect after mount, not during render: reading matchMedia at render time
  // makes the server (false) and client (true, under reduced motion) disagree,
  // which React 19 flags as a hydration mismatch.
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    // One-shot read of a browser-only value after mount; the single re-render is
    // the intended SSR-safe behaviour, not a cascading-render smell.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const later = (fn: () => void, ms: number) => window.setTimeout(fn, ms);

  // Fly the top card off toward (dirX, dirY), then tuck it under the pile.
  const throwTop = React.useCallback(
    (dirX: number, fromX = 0, fromY = 0, dirY = 0) => {
      const w = deckRef.current?.offsetWidth || 400;
      if (busy.current || n < 2) return;
      busy.current = true;
      const i = topRef.current;
      const sx = dirX >= 0 ? 1 : -1;
      setOver({
        i,
        x: fromX + sx * w * 1.25,
        y: fromY + dirY * 0.4 - 40,
        r: sx * 16,
        mode: 'fly',
      });
      later(
        () => {
          setOver(null);
          setTop((t) => wrap(t + 1, n));
          busy.current = false;
        },
        reduce ? 200 : 430,
      );
    },
    [n, reduce],
  );

  // Pull the bottom card back on top from the left.
  const pullBack = React.useCallback(() => {
    const w = deckRef.current?.offsetWidth || 400;
    if (busy.current || n < 2) return;
    busy.current = true;
    const i = wrap(topRef.current - 1, n);
    setOver({ i, x: -w * 1.25, y: -40, r: -16, mode: 'snap' });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setOver({ i, x: 0, y: 0, r: 0, mode: 'fly' });
        later(
          () => {
            setOver(null);
            setTop(i);
            busy.current = false;
          },
          reduce ? 200 : 450,
        );
      }),
    );
  }, [n, reduce]);

  React.useEffect(() => {
    onChange?.(top);
  }, [top, onChange]);

  React.useEffect(() => {
    if (!autoplay || n < 2) return;
    const root = rootRef.current;
    let seen = true;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    if (root) io.observe(root);
    const t = window.setInterval(() => {
      if (!seen || document.hidden || performance.now() - lastTouch.current < autoplay) return;
      throwTop(1);
    }, autoplay);
    return () => {
      window.clearInterval(t);
      io.disconnect();
    };
  }, [autoplay, n, throwTop]);

  // dragging the top card
  const drag = React.useRef(
    null as null | { x: number; y: number; lx: number; lt: number; vx: number },
  );
  const onDown = (e: React.PointerEvent) => {
    lastTouch.current = performance.now();
    if (busy.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, lx: e.clientX, lt: e.timeStamp, vx: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dt = Math.max(1, e.timeStamp - d.lt);
    d.vx = 0.8 * ((e.clientX - d.lx) / dt) + 0.2 * d.vx;
    d.lx = e.clientX;
    d.lt = e.timeStamp;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    setOver({ i: topRef.current, x: dx, y: dy, r: reduce ? 0 : dx * 0.05, mode: 'drag' });
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    lastTouch.current = performance.now();
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const w = deckRef.current?.offsetWidth || 400;
    if (isThrow(dx, d.vx, w)) throwTop(dx, dx, dy, dy);
    else setOver(null);
  };
  const onKey = (e: React.KeyboardEvent) => {
    lastTouch.current = performance.now();
    if (e.key === 'ArrowRight') throwTop(1);
    else if (e.key === 'ArrowLeft') pullBack();
    else return;
    e.preventDefault();
  };

  const s = slides[top] || {};

  return (
    // The W3C APG carousel pattern puts the arrow-key handler and tabIndex
    // on the carousel region itself, not on a nested interactive element.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={rootRef}
      className={['cd-root', className].filter(Boolean).join(' ')}
      style={
        {
          height,
          '--cd-h': typeof height === 'number' ? height + 'px' : height,
          '--cd-w': cardWidth,
          '--cd-aspect': aspect,
          '--cd-ar': aspect,
          '--cd-bg': background,
          '--cd-ink': ink,
          '--cd-muted': 'var(--muted)',
          '--cd-text': 'var(--text-body)',
          '--cd-line': 'var(--rule)',
          '--cd-font-title': 'var(--font-hubot)',
          '--cd-font-sub': 'var(--font-mona)',
          '--cd-font-count': 'var(--font-mono)',
          ...style,
        } as React.CSSProperties
      }
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      onKeyDown={onKey}
    >
      <style>{CD_CSS}</style>
      <div className="cd-row">
        {n > 1 ? (
          <button
            type="button"
            className="cd-peek"
            // Out of the tab order: the explicit Previous/Next buttons below are
            // the keyboard path, so the peeks stay a pointer-only shortcut.
            tabIndex={-1}
            aria-label={
              'Show previous: ' + (slides[wrap(top - 1, n)]?.title || 'previous photo')
            }
            onClick={() => ((lastTouch.current = performance.now()), pullBack())}
          >
            {srcs[wrap(top - 1, n)] ? (
              <img src={srcs[wrap(top - 1, n)]} alt="" draggable={false} />
            ) : null}
          </button>
        ) : null}
        <div ref={deckRef} className="cd-deck">
          {slides.map((sl, i) => {
            const depth = wrap(i - top, n);
            const p = deckPose(depth, tiltFor(i, scatter), reduce);
            const o = over && over.i === i ? over : null;
            const isTop = depth === 0;
            const transform = o
              ? 'translate(' + o.x + 'px,' + o.y + 'px) rotate(' + o.r + 'deg)'
              : 'translateY(' +
                p.y +
                'px) scale(' +
                p.scale +
                ') rotate(' +
                p.rot.toFixed(2) +
                'deg)';
            return (
              <div
                key={i}
                className="cd-card"
                data-top={isTop ? '1' : '0'}
                data-drag={o?.mode === 'drag' ? '1' : '0'}
                data-fly={o?.mode === 'fly' ? '1' : '0'}
                data-snap={o?.mode === 'snap' ? '1' : '0'}
                style={{
                  transform,
                  zIndex: o ? n + 1 : n - depth,
                  opacity: o ? 1 : p.opacity,
                  filter: o || isTop ? 'none' : 'brightness(' + p.shade + ')',
                }}
                aria-hidden={isTop ? undefined : true}
                onPointerDown={isTop ? onDown : undefined}
                onPointerMove={isTop ? onMove : undefined}
                onPointerUp={isTop ? onUp : undefined}
                onPointerCancel={isTop ? onUp : undefined}
              >
                {srcs[i] ? (
                  <img
                    src={srcs[i]}
                    alt={isTop ? sl.alt || sl.title || '' : ''}
                    draggable={false}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        {n > 1 ? (
          <button
            type="button"
            className="cd-peek"
            tabIndex={-1}
            aria-label={'Show next: ' + (slides[wrap(top + 1, n)]?.title || 'next photo')}
            onClick={() => ((lastTouch.current = performance.now()), throwTop(1))}
          >
            {srcs[wrap(top + 1, n)] ? (
              <img src={srcs[wrap(top + 1, n)]} alt="" draggable={false} />
            ) : null}
          </button>
        ) : null}
      </div>
      <div className="cd-meta">
        <button
          type="button"
          className="cd-btn"
          aria-label="Previous"
          onClick={() => ((lastTouch.current = performance.now()), pullBack())}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <div className="cd-center">
          <div className="cd-cap" key={top} aria-hidden="true">
            {s.title ? <span className="cd-title">{s.title}</span> : null}
            {s.caption ? <span className="cd-sub">{s.caption}</span> : null}
          </div>
          <span className="cd-count" aria-hidden="true">
            <b>{pad2(top + 1)}</b> / {pad2(n)}
          </span>
          {s.paragraphs?.length ? (
            <div className="cd-text" key={'p' + top}>
              {s.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="cd-btn"
          aria-label="Next"
          onClick={() => ((lastTouch.current = performance.now()), throwTop(1))}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
      <div className="cd-sr" aria-live="polite">
        {'Card ' + (top + 1) + ' of ' + n + (s.title ? ': ' + s.title : '')}
      </div>
    </div>
  );
}
