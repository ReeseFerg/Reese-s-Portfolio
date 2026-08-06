import { useEffect, useRef } from 'react';

/**
 * The bar across the top of a case study showing how far through the read you
 * are. Written straight to the DOM node rather than through state — this runs
 * on every scroll frame, and re-rendering React for it would be wasteful.
 */
export default function ReadProgress({
  active,
  reduced,
}: {
  active: boolean;
  reduced: boolean;
}) {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    if (!active) {
      bar.style.width = '0%';
      return;
    }

    let ticking = false;

    const update = () => {
      ticking = false;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      bar.style.width = (pct * 100).toFixed(2) + '%';
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      if (reduced) update();
      else requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [active, reduced]);

  return (
    <div className="read-progress" aria-hidden="true">
      <span id="readBar" ref={barRef} />
    </div>
  );
}
