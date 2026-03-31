import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SlideRef } from '../types';
import { searchSlides } from '../searchSlides';
import type { SlideSearchResult } from '../types';

type ResultItem = SlideSearchResult & { flatIndex: number };
type ResultGroup = { section: string | undefined; items: ResultItem[] };

function groupBySection(results: SlideSearchResult[]): ResultGroup[] {
  const groups: ResultGroup[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const last = groups[groups.length - 1];
    const item: ResultItem = { ...result, flatIndex: i };
    if (last && last.section === result.section) {
      last.items.push(item);
    } else {
      groups.push({ section: result.section, items: [item] });
    }
  }
  return groups;
}

export function JumpSearchDialog(props: {
  deck: readonly SlideRef[];
  onClose: () => void;
  onSelectPath: (path: string) => void;
}) {
  const { deck, onClose, onSelectPath } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchSlides(deck, query), [deck, query]);
  const groups = useMemo(() => groupBySection(results), [results]);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    queueMicrotask(() => inputRef.current?.focus());
    // Save the previously-focused element and restore on unmount. Only DOM side-effects — no setState.
    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setHighlightIndex(0); // reset highlight in the event handler, not an effect
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === '/') {
      e.preventDefault();
      return;
    }

    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % results.length);
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + results.length) % results.length);
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = results[highlightIndex];
      onSelectPath(chosen.path);
      onClose();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Jump to slide"
      className="fixed inset-0 z-50 flex items-start justify-center p-6"
      onMouseDown={(e) => {
        // close when clicking backdrop only
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl rounded-lg bg-background p-4 shadow-lg border border-foreground/10"
        onKeyDown={onKeyDown}
      >
        <div className="text-sm font-medium" id="jump-dialog-title">
          Jump to slide ( / )
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={handleQueryChange}
          className="mt-2 w-full rounded-md border px-3 py-2"
          placeholder="Type a slide number or title"
          aria-label="Search slides"
        />

        <div className="mt-3">
          {results.length === 0 ? (
            <div className="text-sm text-zinc-500">No matching slides</div>
          ) : (
            <ul className="space-y-1" role="listbox" aria-label="Slide results">
              {groups.map((group) => (
                <React.Fragment key={group.section ?? '__ungrouped__'}>
                  {group.section !== undefined && (
                    <li
                      role="presentation"
                      className="px-2 pt-2 pb-0.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide"
                    >
                      {group.section}
                    </li>
                  )}
                  {group.items.map((r) => (
                    <li
                      key={r.path}
                      role="option"
                      aria-selected={r.flatIndex === highlightIndex}
                      className={
                        r.flatIndex === highlightIndex
                          ? 'rounded-md bg-foreground text-background px-2 py-1 cursor-pointer'
                          : 'rounded-md px-2 py-1 cursor-pointer'
                      }
                      onMouseDown={() => {
                        onSelectPath(r.path);
                        onClose();
                      }}
                    >
                      {r.number}. {r.title}
                    </li>
                  ))}
                </React.Fragment>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
