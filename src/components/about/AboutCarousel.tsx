import * as React from 'react';

import { type LandPalette, usePlaceholderImages } from './placeholder-art';

/*
 * Fan Carousel — each hobby shows three photos fanned like a hand of cards,
 * one centred and two tilted back on either side. Clicking an outer photo,
 * or dragging it inward past a threshold (same feel as the old PhotoStack:
 * a plain distance check, no velocity), rotates it into the centre; the
 * other two photos rotate around it, array-style — not a two-card swap.
 * Clicking the centred photo also rotates, always in the same direction as
 * clicking the right photo.
 *
 * None of that changes which hobby is showing. Only the Prev/Next buttons
 * (and the arrow keys) do that: collapsing the fan into a pile, swapping in
 * the next hobby's photos, then expanding back out.
 *
 * A hobby can show a single flat video instead of the photo fan, for cases
 * where only one clip exists rather than three stills — no rotate
 * interaction, just the deck's usual Prev/Next.
 *
 * Photos without an `image` get a painted landscape, so it works with no
 * assets at all.
 */

export type HobbyPhoto = {
  image?: string;
  alt?: string;
  /** Palette and seed of the painted landscape used when `image` is empty. */
  palette?: LandPalette;
  seed?: number;
};

export type Slide = {
  title?: string;
  caption?: string;
  /** Body paragraphs shown below the title and pagination count. */
  paragraphs?: string[];
  /** Exactly three photos, fanned and rotatable. Omit when using `video`. */
  photos?: HobbyPhoto[];
  /** A single flat video shown instead of the photo fan. */
  video?: string;
  videoPoster?: string;
  videoAlt?: string;
  /** Overrides the deck's `aspect` prop for this slide's video, if its
      footage is a different shape (e.g. a portrait phone recording). */
  videoAspect?: string;
};

export type AboutCarouselProps = {
  slides?: Slide[];
  /** Any CSS length. Default 100svh. */
  height?: number | string;
  /** Width of a card, any CSS length. */
  cardWidth?: string;
  /** CSS aspect-ratio of a card. */
  aspect?: string;
  /** Max tilt in degrees of the collapsed pile's lower cards. */
  scatter?: number;
  background?: string;
  ink?: string;
  onChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
};

/** Every hobby fans exactly this many photos. */
const PHOTOS_PER_HOBBY = 3;

// #region logic
export function wrap(i: number, n: number): number {
  return n ? ((i % n) + n) % n : 0;
}

/** A stable, slightly random tilt per card, in [-max, max] degrees. */
export function tiltFor(i: number, max: number): number {
  const u = (((i + 1) * 2654435761) >>> 0) / 4294967296;
  return (u * 2 - 1) * max;
}

/** Fanned pose for slot `k` of `total` (0 = left, …, centre, …, last = right). */
export function fanPose(k: number, total: number, spread: number, angle: number, lift: number) {
  const offset = k - (total - 1) / 2;
  return {
    x: offset * spread,
    y: Math.abs(offset) * lift,
    rot: offset * angle,
    z: 10 - Math.round(Math.abs(offset) * 2),
  };
}

/** Collapsed pose for card `k`: a loose single pile, straight on top. */
export function pilePose(k: number, tilt: number) {
  return {
    x: 0,
    y: k * 4,
    rot: tiltFor(k, tilt),
    z: 10 - k,
  };
}

/**
 * Rotates which photo sits in which fan slot (0 left, 1 centre, 2 right).
 * `dir: 1` brings the right photo to centre, centre to left, left to right
 * (wrapping) — the direction a right-photo or centre-photo click uses.
 * `dir: -1` runs the same rotation the other way, for a left-photo click.
 */
export function rotateOrder(order: number[], dir: 1 | -1): number[] {
  return dir === 1 ? [order[1], order[2], order[0]] : [order[2], order[0], order[1]];
}

export function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n);
}
// #endregion logic

const DEFAULT_SLIDES: Slide[] = [
  {
    title: 'First Light',
    caption: 'Haze lifting off the eastern ridges.',
    photos: [
      { palette: 'dawn', seed: 3 },
      { palette: 'alpine', seed: 8 },
      { palette: 'dusk', seed: 14 },
    ],
  },
  {
    title: 'High Pass',
    caption: 'Cold air, clear to the far range.',
    photos: [
      { palette: 'mist', seed: 21 },
      { palette: 'dawn', seed: 34 },
      { palette: 'alpine', seed: 55 },
    ],
  },
];

const CD_CSS = [
  '.cd-root{position:relative;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(28px,5vh,52px);overflow:hidden;background:var(--cd-bg);color:var(--cd-ink);outline:none;padding:24px 16px;box-sizing:border-box}',
  '.cd-root:focus-visible{box-shadow:inset 0 0 0 2px var(--cd-ink)}',
  '.cd-deck{position:relative;width:var(--cd-w);aspect-ratio:var(--cd-aspect);max-height:calc(var(--cd-h) * .62);max-width:calc(var(--cd-h) * .62 * var(--cd-ar));flex-shrink:0}',
  '.cd-card{position:absolute;inset:0;appearance:none;margin:0;padding:0;border:0;border-radius:18px;overflow:hidden;background:#d9d5cc;box-shadow:0 1px 2px rgba(0,0,0,.08),0 30px 60px -30px rgba(0,0,0,.45);cursor:default;transition:transform var(--duration-slow) var(--ease-standard),opacity var(--duration-medium) var(--ease-standard)}',
  // Clicking or dragging a photo is only wired up while the fan is resting;
  // mid-transition (hobby switch) interactions are a no-op (busy-locked).
  ".cd-deck[data-phase='fanned'] .cd-card{cursor:pointer}",
  '.cd-card img,.cd-card video{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block;pointer-events:none;user-select:none}',
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
  // Belt two: case-chrome.ts-style JS already shortens the collapse/expand
  // timers under reduced motion, but this keeps the CSS correct even if a
  // card's transform ever changes outside that JS path.
  '@media (prefers-reduced-motion:reduce){.cd-card{transition:transform var(--duration-fast) var(--ease-standard),opacity var(--duration-fast) var(--ease-standard)}.cd-cap>*{animation:none}}',
].join('\n');

type Phase = 'fanned' | 'collapsing' | 'expanding';

/** Distance, in px, an outer photo must be dragged inward to commit — same
    fixed threshold the old PhotoStack used (no velocity component). */
const DRAG_THRESHOLD = 120;
/** Below this, a pointer up/down pair is a click, not a drag. */
const DRAG_DEADZONE = 6;

const defaultOrder = () => Array.from({ length: PHOTOS_PER_HOBBY }, (_, i) => i);

/** Deck size and fan geometry per width tier. `deckMaxWidth` is the whole
    story for card size — it overrides the CSS formula derived from the
    `height` prop, so a tier's size is this table, not a screen-dependent
    calculation. Height follows from `aspect` automatically. */
const TIER = {
  wide: { deckMaxWidth: '240px', spread: 110, fanAngle: 12, fanLift: 18, textMinHeight: 112 },
  medium: { deckMaxWidth: '200px', spread: 80, fanAngle: 10, fanLift: 14, textMinHeight: 140 },
  narrow: { deckMaxWidth: '190px', spread: 28, fanAngle: 8, fanLift: 10, textMinHeight: 228 },
} as const;

export default function AboutCarousel({
  slides = DEFAULT_SLIDES,
  height = '100svh',
  cardWidth = 'min(78vw, 440px)',
  aspect = '4 / 5',
  scatter = 6,
  background = 'transparent',
  ink = 'var(--text)',
  onChange,
  className,
  style,
  ariaLabel = 'Image carousel',
}: AboutCarouselProps) {
  const n = slides.length;

  // Flatten every hobby's photos into one list so painted placeholders are
  // generated once, then slice the results back out per hobby below. Slide
  // counts are tiny (a handful of hobbies), so the O(n^2) start-offset isn't
  // worth memoizing away.
  const flatPhotos = React.useMemo(() => slides.flatMap((s) => s.photos ?? []), [slides]);
  const flatSrcs = usePlaceholderImages(flatPhotos);
  const photoCounts = slides.map((s) => s.photos?.length ?? 0);
  const srcsBySlide = photoCounts.map((count, idx) => {
    const start = photoCounts.slice(0, idx).reduce((a, b) => a + b, 0);
    return flatSrcs.slice(start, start + count);
  });

  const [current, setCurrent] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>('fanned');
  // Which photo occupies which fan slot (0 left, 1 centre, 2 right) for the
  // current hobby; reset to the hobby's natural order on every switch.
  const [order, setOrder] = React.useState<number[]>(defaultOrder);
  const rootRef = React.useRef(null as HTMLDivElement | null);
  const busy = React.useRef(false);

  // Detect after mount, not during render: reading matchMedia at render time
  // makes the server (false) and client (true, under reduced motion) disagree,
  // which React 19 flags as a hydration mismatch.
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduce(mq.matches);
    const onChangeMq = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener('change', onChangeMq);
    return () => mq.removeEventListener('change', onChangeMq);
  }, []);

  // Three size tiers, at the same 980px/640px window-width cuts the rest of
  // the site uses (responsive.css), rather than a single ad hoc breakpoint.
  // The deck's max-width is pinned per tier (not derived from the `height`
  // prop's vh-based formula) so it's a known, deliberate size at every
  // width instead of just whatever a vh/vw formula happens to compute on a
  // given screen.
  const [isAtMost980, setIsAtMost980] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 980px)');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAtMost980(mq.matches);
    const onChangeMq = (e: MediaQueryListEvent) => setIsAtMost980(e.matches);
    mq.addEventListener('change', onChangeMq);
    return () => mq.removeEventListener('change', onChangeMq);
  }, []);
  const [isAtMost640, setIsAtMost640] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAtMost640(mq.matches);
    const onChangeMq = (e: MediaQueryListEvent) => setIsAtMost640(e.matches);
    mq.addEventListener('change', onChangeMq);
    return () => mq.removeEventListener('change', onChangeMq);
  }, []);
  const tier: 'wide' | 'medium' | 'narrow' = isAtMost640
    ? 'narrow'
    : isAtMost980
      ? 'medium'
      : 'wide';

  const { deckMaxWidth, spread, fanAngle, fanLift, textMinHeight } = TIER[tier];
  // Mirrors --duration-fast / --duration-slow in tokens.css; the CSS transition
  // itself picks the same pair via the reduced-motion block in CD_CSS above.
  const stepMs = reduce ? 120 : 520;

  const later = (fn: () => void, ms: number) => window.setTimeout(fn, ms);

  const goTo = React.useCallback(
    (dir: 1 | -1) => {
      if (busy.current || n < 2) return;
      busy.current = true;
      setPhase('collapsing');
      later(() => {
        setCurrent((c) => wrap(c + dir, n));
        setOrder(defaultOrder());
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setPhase('expanding');
            later(() => {
              setPhase('fanned');
              busy.current = false;
            }, stepMs);
          }),
        );
      }, stepMs);
    },
    [n, stepMs],
  );

  const goNext = React.useCallback(() => goTo(1), [goTo]);
  const goPrev = React.useCallback(() => goTo(-1), [goTo]);

  React.useEffect(() => {
    onChange?.(current);
  }, [current, onChange]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      goNext();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      goPrev();
      e.preventDefault();
    } else if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
      // Only when the region itself is focused: when focus is on a nested
      // Prev/Next button, that button's own onClick already handles
      // activation, and firing goNext here too would fight a Prev press.
      goNext();
      e.preventDefault();
    }
  };

  const s = slides[current] || {};
  const srcs = srcsBySlide[current] || [];
  const piled = phase === 'collapsing';
  const fanned = phase === 'fanned';

  const rotate = React.useCallback((dir: 1 | -1) => {
    setOrder((o) => rotateOrder(o, dir));
  }, []);

  // Drag tracking for the two outer slots only (the centre photo is click-
  // only — there's nowhere "inward" for it to be dragged from). Kept in a
  // ref so pointermove doesn't thrash state; only the live offset (for the
  // card that's actually being dragged) needs a render.
  const dragRef = React.useRef(
    null as {
      slot: 0 | 2;
      pointerId: number;
      startX: number;
      dx: number;
      dragged: boolean;
    } | null,
  );
  const [liveDrag, setLiveDrag] = React.useState(null as { slot: 0 | 2; dx: number } | null);
  // A real drag's pointerup already decided whether to rotate; the browser
  // still fires a click right after, which must be swallowed once rather
  // than acted on again. dragRef itself is cleared by then (its dx needs to
  // reach the pointerup handler first), so this is a separate flag.
  const suppressClickRef = React.useRef(false);

  const onCardClick = (slot: 0 | 1 | 2) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (!fanned) return;
    rotate(slot === 0 ? -1 : 1);
  };

  const onCardPointerDown = (slot: 0 | 2, e: React.PointerEvent<HTMLButtonElement>) => {
    if (!fanned) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      slot,
      pointerId: e.pointerId,
      startX: e.clientX,
      dx: 0,
      dragged: false,
    };
  };

  const onCardPointerMove = (slot: 0 | 2, e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d || d.slot !== slot || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    d.dx = dx;
    if (Math.abs(dx) > DRAG_DEADZONE) d.dragged = true;
    setLiveDrag({ slot, dx });
  };

  const endDrag = (slot: 0 | 2, e: React.PointerEvent<HTMLButtonElement>, commit: boolean) => {
    const d = dragRef.current;
    if (!d || d.slot !== slot || d.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setLiveDrag(null);
    if (d.dragged) suppressClickRef.current = true;
    if (commit && d.dragged) {
      // "Inward" means toward the centre: rightward for the left card,
      // leftward for the right card. A drag the wrong way never commits,
      // however far it travels.
      const inward = slot === 0 ? d.dx > DRAG_THRESHOLD : d.dx < -DRAG_THRESHOLD;
      if (inward) rotate(slot === 0 ? -1 : 1);
    }
  };

  const onCardPointerUp = (slot: 0 | 2, e: React.PointerEvent<HTMLButtonElement>) =>
    endDrag(slot, e, true);
  const onCardPointerCancel = (slot: 0 | 2, e: React.PointerEvent<HTMLButtonElement>) =>
    endDrag(slot, e, false);

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
      {s.video ? (
        <div
          className="cd-deck cd-deck--video"
          aria-hidden="true"
          style={
            {
              ...(deckMaxWidth ? { maxWidth: deckMaxWidth } : null),
              ...(s.videoAspect
                ? { '--cd-aspect': s.videoAspect, '--cd-ar': s.videoAspect }
                : null),
            } as React.CSSProperties
          }
        >
          <div className="cd-card">
            <video
              src={s.video}
              poster={s.videoPoster}
              autoPlay
              loop
              muted
              playsInline
              aria-label={s.videoAlt || s.title || ''}
            />
          </div>
        </div>
      ) : (
        <div
          className="cd-deck"
          data-phase={phase}
          aria-hidden="true"
          style={deckMaxWidth ? { maxWidth: deckMaxWidth } : undefined}
        >
          {order.map((photoIndex, slot) => {
            const pose = piled
              ? pilePose(slot, scatter)
              : fanPose(slot, PHOTOS_PER_HOBBY, spread, fanAngle, fanLift);
            const dragging = liveDrag !== null && liveDrag.slot === slot;
            const dragX = dragging ? liveDrag!.dx : 0;
            const draggable = slot === 0 || slot === 2;
            return (
              <button
                key={photoIndex}
                type="button"
                className="cd-card"
                tabIndex={-1}
                style={{
                  transform:
                    'translate(' +
                    (pose.x + dragX) +
                    'px,' +
                    pose.y +
                    'px) rotate(' +
                    pose.rot.toFixed(2) +
                    'deg)',
                  zIndex: pose.z,
                  transition: dragging ? 'none' : undefined,
                }}
                onClick={() => onCardClick(slot as 0 | 1 | 2)}
                onPointerDown={
                  draggable ? (e) => onCardPointerDown(slot as 0 | 2, e) : undefined
                }
                onPointerMove={
                  draggable ? (e) => onCardPointerMove(slot as 0 | 2, e) : undefined
                }
                onPointerUp={draggable ? (e) => onCardPointerUp(slot as 0 | 2, e) : undefined}
                onPointerCancel={
                  draggable ? (e) => onCardPointerCancel(slot as 0 | 2, e) : undefined
                }
              >
                {srcs[photoIndex] ? (
                  <img src={srcs[photoIndex]} alt="" draggable={false} />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
      <div className="cd-meta">
        <button type="button" className="cd-btn" aria-label="Previous" onClick={goPrev}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <div className="cd-center">
          <div className="cd-cap" key={current} aria-hidden="true">
            {s.title ? <span className="cd-title">{s.title}</span> : null}
            {s.caption ? <span className="cd-sub">{s.caption}</span> : null}
          </div>
          <span className="cd-count" aria-hidden="true">
            <b>{pad2(current + 1)}</b> / {pad2(n)}
          </span>
          {s.paragraphs?.length ? (
            <div className="cd-text" key={'p' + current} style={{ minHeight: textMinHeight }}>
              {s.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : null}
        </div>
        <button type="button" className="cd-btn" aria-label="Next" onClick={goNext}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
      <div className="cd-sr" aria-live="polite">
        {'Card ' + (current + 1) + ' of ' + n + (s.title ? ': ' + s.title : '')}
      </div>
    </div>
  );
}
