import { useEffect, useState } from 'react';

const TYPE = 55;
const ERASE = 30;
const HOLD = 1600;
const GAP = 400;

/**
 * Types each phrase, holds it, erases it, moves to the next — the welcome line's
 * "Reese is …" cycle. Under reduced motion it settles on the first phrase and
 * never animates. `paused` freezes it for the dev panel's text-edit mode, which
 * would otherwise fight the user for the same DOM node.
 */
export function useTypewriter(phrases: string[], reduced: boolean, paused = false): string {
  const [typed, setText] = useState('');

  // Under reduced motion the line is static, so it's derived rather than stored.
  const text = reduced ? phrases[0] : typed;

  useEffect(() => {
    if (reduced || paused) return;

    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    let index = 0;

    const type = (phrase: string, at: number, done: () => void) => {
      if (cancelled) return;
      if (at > phrase.length) return done();
      setText(phrase.slice(0, at));
      timer = setTimeout(() => type(phrase, at + 1, done), TYPE);
    };

    const erase = (at: number, done: () => void) => {
      if (cancelled) return;
      if (at <= 0) return done();
      setText((t) => t.slice(0, -1));
      timer = setTimeout(() => erase(at - 1, done), ERASE);
    };

    const cycle = () => {
      const phrase = phrases[index];
      type(phrase, 0, () => {
        timer = setTimeout(() => {
          erase(phrase.length, () => {
            index = (index + 1) % phrases.length;
            timer = setTimeout(cycle, GAP);
          });
        }, HOLD);
      });
    };

    cycle();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phrases, reduced, paused]);

  return text;
}
