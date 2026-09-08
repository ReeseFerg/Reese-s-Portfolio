import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import { COMMANDS, type Command } from '../../lib/commands';

type Props = {
  onExecute: (raw: string) => void;
};

/**
 * The prompt line. Typing a `/` opens the suggestion list, which Tab completes,
 * arrows move through and Enter runs — the same keys the real CLI uses.
 */
const CommandInput = forwardRef<HTMLInputElement, Props>(function CommandInput(
  { onExecute },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);

  const [value, setValue] = useState('');
  const [items, setItems] = useState<Command[]>([]);
  const [cursor, setCursor] = useState(0);

  const open = items.length > 0;

  const refresh = (next: string) => {
    setValue(next);
    const v = next.trim().toLowerCase();
    if (v.startsWith('/')) {
      setItems(
        COMMANDS.filter((c) => c.cmd.toLowerCase().startsWith(v) && c.cmd.toLowerCase() !== v),
      );
      setCursor(0);
    } else {
      setItems([]);
    }
  };

  const close = () => setItems([]);

  const run = (raw: string) => {
    close();
    setValue('');
    onExecute(raw);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setCursor((c) => (c + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length);
    } else if (open && e.key === 'Tab') {
      e.preventDefault();
      refresh(items[cursor].cmd);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(open ? items[cursor].cmd : value);
    } else if (e.key === 'Escape') {
      close();
      inputRef.current?.blur();
    }
  };

  return (
    <div className={'input-area' + (value.length > 0 ? ' has-text' : '')} id="inputArea">
      <div className="input-rule" />
      <div className="input-row">
        <span className="chevron">❯</span>
        <span className="input-cursor" />
        <input
          id="cmd"
          ref={inputRef}
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="type a command — try /work, /about or ? for shortcuts"
          aria-label="Command input"
          value={value}
          onChange={(e) => refresh(e.target.value)}
          onKeyDown={onKeyDown}
          // Delayed so a click on a suggestion registers before the list closes.
          onBlur={() => setTimeout(close, 120)}
        />
      </div>
      <div className="input-rule" />
      <div className={'suggest' + (open ? ' is-open' : '')} id="suggest">
        {items.map((c, i) => (
          <button
            key={c.cmd}
            type="button"
            className={'suggest-row' + (i === cursor ? ' is-selected' : '')}
            onMouseDown={(e) => e.preventDefault()} // keep focus in the input
            onClick={() => run(c.cmd)}
          >
            <span className="s-cmd">{c.cmd}</span>
            <span className="s-desc">{c.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

export default CommandInput;
