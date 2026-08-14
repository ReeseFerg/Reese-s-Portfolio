import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/**
 * Every animation on the site checks this. It tracks changes at runtime rather
 * than reading the query once at load, so flipping the OS setting takes effect
 * without a reload.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false, // SSR'd HTML assumes motion on — matches the pre-typing state, so client:load hydration is a no-op instead of flashing the reduced state
  );
}
