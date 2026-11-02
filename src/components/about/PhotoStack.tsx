import {
  MotionConfig,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import * as React from 'react';

import { type PaintableItem, usePlaceholderImages } from './placeholder-art';

/*
 * Photo Stack — a square pile of photos. Drag the front one far enough in
 * any direction and it flies off, then rejoins the back of the pile; the
 * next one is already underneath. Cards without an `image` get a painted
 * landscape placeholder, so it reads fine before real photos land.
 */

export type PhotoStackItem = PaintableItem & {
  id: number | string;
  alt?: string;
};

export type PhotoStackSettings = {
  /** Card width/height in px (square). */
  size: number;
  radius: number;
  swipeThreshold: number;
  stackRotation: number;
  stackScale: number;
  tiltStrength: number;
  springStiffness: number;
  springDamping: number;
};

const DEFAULT_SETTINGS: PhotoStackSettings = {
  size: 320,
  radius: 16,
  swipeThreshold: 120,
  stackRotation: 5,
  stackScale: 0.035,
  tiltStrength: 25,
  springStiffness: 300,
  springDamping: 30,
};

const DEFAULT_ITEMS: PhotoStackItem[] = [
  { id: 1, palette: 'dawn', seed: 3 },
  { id: 2, palette: 'alpine', seed: 8 },
  { id: 3, palette: 'dusk', seed: 14 },
];

type CardProps = {
  children: React.ReactNode;
  isFront: boolean;
  zIndex: number;
  onSendToBack: () => void;
  settings: PhotoStackSettings;
  reduce: boolean;
};

function StackCard({ children, isFront, zIndex, onSendToBack, settings, reduce }: CardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(
    y,
    [-200, 200],
    reduce ? [0, 0] : [settings.tiltStrength, -settings.tiltStrength],
  );
  const rotateY = useTransform(
    x,
    [-200, 200],
    reduce ? [0, 0] : [-settings.tiltStrength, settings.tiltStrength],
  );

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const draggedFarEnough =
      Math.abs(info.offset.x) > settings.swipeThreshold ||
      Math.abs(info.offset.y) > settings.swipeThreshold;
    if (draggedFarEnough) {
      onSendToBack();
    }
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className="ps-card"
      style={{
        x: isFront ? x : 0,
        y: isFront ? y : 0,
        rotateX: isFront ? rotateX : 0,
        rotateY: isFront ? rotateY : 0,
        zIndex,
      }}
      drag={isFront}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      whileHover={isFront ? { scale: 1.03 } : {}}
      transition={{
        type: 'spring',
        stiffness: settings.springStiffness,
        damping: settings.springDamping,
      }}
    >
      {children}
    </motion.div>
  );
}

export type PhotoStackProps = {
  items?: PhotoStackItem[];
  settings?: Partial<PhotoStackSettings>;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
};

const PS_CSS = [
  '.ps-root{position:relative;display:flex;align-items:center;justify-content:center;user-select:none}',
  // The stage fills the height handed to it by the parent (on the About page the
  // intro text column's height), capped to the column width — the full photo size.
  '.ps-stage{position:relative;perspective:1200px;height:100%;aspect-ratio:1;max-width:100%;margin-inline:auto}',
  '.ps-card{position:absolute;inset:0;cursor:grab;touch-action:none}',
  '.ps-card:active{cursor:grabbing}',
  '.ps-frame{position:relative;height:100%;width:100%;overflow:hidden;background:var(--ps-bg);box-shadow:0 1px 2px rgba(0,0,0,.08),0 30px 60px -30px rgba(0,0,0,.5)}',
  '.ps-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;user-select:none}',
  // Keyboard path + visible affordance, just below the pile. Absolutely placed so
  // the stage keeps its full size; the row reserves the overhang (see case.css).
  '.ps-controls{position:absolute;top:100%;left:0;right:0;margin-top:42px;display:flex;justify-content:center;gap:10px}',
  '.ps-btn{appearance:none;width:40px;height:40px;border-radius:50%;border:1px solid var(--rule);background:transparent;color:var(--text);display:grid;place-items:center;cursor:pointer;transition:background .2s ease,color .2s ease}',
  '.ps-btn:hover{background:var(--text);color:var(--bg)}',
  '.ps-btn:focus-visible{outline:2px solid var(--text);outline-offset:2px}',
  '@media (prefers-reduced-motion:reduce){.ps-card,.ps-btn{transition:none}}',
].join('\n');

export default function PhotoStack({
  items = DEFAULT_ITEMS,
  settings,
  className,
  style,
  ariaLabel = 'Photos of Reese',
}: PhotoStackProps) {
  const config = { ...DEFAULT_SETTINGS, ...settings };
  const [order, setOrder] = React.useState(items);
  const srcs = usePlaceholderImages(order);
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

  // Send the front photo to the back of the pile ("next").
  const next = () => setOrder((prev) => (prev.length < 2 ? prev : [...prev.slice(1), prev[0]]));
  // Bring the back photo to the front ("previous").
  const prev = () => setOrder((p) => (p.length < 2 ? p : [p[p.length - 1], ...p.slice(0, -1)]));

  const multiple = order.length > 1;

  return (
    <div
      className={['ps-root', className].filter(Boolean).join(' ')}
      style={
        {
          '--ps-bg': 'var(--rule-soft)',
          '--ps-size': config.size + 'px',
          borderRadius: config.radius,
          ...style,
        } as React.CSSProperties
      }
      role="group"
      aria-label={ariaLabel}
    >
      <style>{PS_CSS}</style>
      {/* reducedMotion="user" lets framer honour the OS setting for the
          send-to-back spring and whileHover scale, matching the rest of the site. */}
      <MotionConfig reducedMotion="user">
        <div className="ps-stage">
          {order.map((item, index) => {
            const isFront = index === 0;
            const src = srcs[index];
            return (
              <StackCard
                key={item.id}
                isFront={isFront}
                zIndex={order.length - index}
                settings={config}
                reduce={reduce}
                onSendToBack={next}
              >
                <motion.div
                  className="ps-frame"
                  style={{ borderRadius: config.radius }}
                  animate={{
                    rotateZ: reduce ? 0 : index * config.stackRotation,
                    scale: 1 - index * config.stackScale,
                    transformOrigin: '50% 50%',
                  }}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                >
                  {src ? (
                    <img src={src} alt={isFront ? item.alt || '' : ''} draggable={false} />
                  ) : null}
                </motion.div>
              </StackCard>
            );
          })}
        </div>
        {multiple ? (
          <div className="ps-controls">
            <button type="button" className="ps-btn" aria-label="Previous photo" onClick={prev}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
            <button type="button" className="ps-btn" aria-label="Next photo" onClick={next}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </div>
        ) : null}
      </MotionConfig>
    </div>
  );
}
