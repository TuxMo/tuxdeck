import { describe, expect, it } from 'vitest';
import { slideIndexForPath, slideNumberForPath } from '../src/deckUtils';

const deck = [
  { path: '/present/001-intro', title: 'Intro' },
  { path: '/present/002-agenda', title: 'Agenda' },
  { path: '/present/003-qa', title: 'Q&A' },
];

describe('slideIndexForPath', () => {
  it('returns 0-based index for known paths', () => {
    expect(slideIndexForPath(deck, deck[0].path)).toBe(0);
    expect(slideIndexForPath(deck, deck[deck.length - 1].path)).toBe(deck.length - 1);
  });

  it('returns 0 for unknown paths', () => {
    expect(slideIndexForPath(deck, '/present/does-not-exist')).toBe(0);
  });
});

describe('slideNumberForPath', () => {
  it('returns 1-based number for known paths', () => {
    expect(slideNumberForPath(deck, deck[0].path)).toBe(1);
    expect(slideNumberForPath(deck, deck[deck.length - 1].path)).toBe(deck.length);
  });

  it('returns null for unknown paths', () => {
    expect(slideNumberForPath(deck, '/present/does-not-exist')).toBeNull();
  });
});
