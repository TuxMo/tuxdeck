import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Jump to slide"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '48px 24px',
        background: 'rgba(0,0,0,0.5)',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: '8px',
          background: '#111',
          color: '#fff',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxSizing: 'border-box',
        }}
        onKeyDown={onKeyDown}
      >
        <div
          style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}
          id="jump-dialog-title"
        >
          Jump to slide ( / )
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={handleQueryChange}
          style={{
            width: '100%',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '8px 12px',
            background: '#1a1a1a',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          placeholder="Type a slide number or title"
          aria-label="Search slides"
        />

        <div style={{ marginTop: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#888' }}>No matching slides</div>
          ) : (
            <ul
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
              role="listbox"
              aria-label="Slide results"
            >
              {groups.map((group) => (
                <React.Fragment key={group.section ?? '__ungrouped__'}>
                  {group.section !== undefined && (
                    <li
                      role="presentation"
                      style={{
                        padding: '8px 8px 2px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#888',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {group.section}
                    </li>
                  )}
                  {group.items.map((r) => (
                    <li
                      key={r.path}
                      role="option"
                      aria-selected={r.flatIndex === highlightIndex}
                      style={{
                        borderRadius: '6px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        background: r.flatIndex === highlightIndex ? '#fff' : 'transparent',
                        color: r.flatIndex === highlightIndex ? '#111' : '#fff',
                      }}
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
    </div>,
    document.body,
  );
}
