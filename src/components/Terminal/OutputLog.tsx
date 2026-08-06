import { useEffect, useState } from 'react';

export type LogLine = {
  id: number;
  kind: 'out-echo' | 'out-resp' | 'out-err';
  marker: string;
  text: string;
};

const CHAR_MS = 8;

/** Types a line out character by character, or shows it whole under reduced motion. */
function Line({ line, reduced }: { line: LogLine; reduced: boolean }) {
  const [typed, setTyped] = useState('');

  // Under reduced motion the full text is simply what's shown — no state needed.
  const shown = reduced ? line.text : typed;

  useEffect(() => {
    if (reduced) return;
    let at = 0;
    const id = setInterval(() => {
      at += 1;
      setTyped(line.text.slice(0, at));
      if (at >= line.text.length) clearInterval(id);
    }, CHAR_MS);
    return () => clearInterval(id);
  }, [line.text, reduced]);

  return (
    <p className={'out-line ' + line.kind}>
      <span className="marker">{line.marker}</span>
      <span>{shown}</span>
    </p>
  );
}

export default function OutputLog({ lines, reduced }: { lines: LogLine[]; reduced: boolean }) {
  return (
    <div className="term-output" id="output" aria-live="polite">
      {lines.map((line) => (
        <Line key={line.id} line={line} reduced={reduced} />
      ))}
    </div>
  );
}
