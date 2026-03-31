import { describe, expect, it } from 'vitest';
import { searchSlides } from '../src/searchSlides';
import type { SlideRef, SlideSearchResult } from '../src/types';

const deck = [
  { path: '/present/001-intro', title: 'Intro' },
  { path: '/present/002-roadmap', title: 'Quarterly Roadmap' },
  { path: '/present/003-qa', title: 'Q&A' },
];

describe('searchSlides', () => {
  it('returns all slides for empty query', () => {
    const results = searchSlides(deck, '');
    expect(results).toHaveLength(3);
    expect(results[0].number).toBe(1);
    expect(results[2].number).toBe(3);
  });

  it('returns all slides for whitespace-only query', () => {
    expect(searchSlides(deck, '   ')).toHaveLength(3);
  });

  it('matches titles case-insensitively', () => {
    expect(searchSlides(deck, 'road').map((r) => r.path)).toEqual(['/present/002-roadmap']);
    expect(searchSlides(deck, 'ROAD').map((r) => r.path)).toEqual(['/present/002-roadmap']);
  });

  it('matches numeric-only 1-based slide number', () => {
    expect(searchSlides(deck, '1')[0].path).toBe('/present/001-intro');
    expect(searchSlides(deck, '3')[0].path).toBe('/present/003-qa');
  });

  it('returns empty for out-of-range numeric query', () => {
    expect(searchSlides(deck, '0')).toEqual([]);
    expect(searchSlides(deck, '4')).toEqual([]);
  });

  it('returns empty when no title matches', () => {
    expect(searchSlides(deck, 'zzz')).toEqual([]);
  });

  it('preserves deck order in results', () => {
    const results = searchSlides(deck, 'a');
    // "Quarterly Roadmap" and "Q&A" both contain "a"
    expect(results.map((r) => r.number)).toEqual([2, 3]);
  });
});

describe('searchSlides with sections', () => {
  const deckWithSections: SlideRef[] = [
    { path: '/s/1', title: 'Welcome', section: 'Intro' },
    { path: '/s/2', title: 'Agenda', section: 'Intro' },
    { path: '/s/3', title: 'Architecture', section: 'Deep Dive' },
    { path: '/s/4', title: 'Demo', section: 'Deep Dive' },
  ];

  it('returns section on each result when deck has sections', () => {
    const results = searchSlides(deckWithSections, '');
    expect(results[0].section).toBe('Intro');
    expect(results[2].section).toBe('Deep Dive');
  });

  it('filters by title within a section correctly', () => {
    const results = searchSlides(deckWithSections, 'arch');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Architecture');
    expect(results[0].section).toBe('Deep Dive');
  });

  it('handles mixed deck (some slides with section, some without)', () => {
    const mixedDeck: SlideRef[] = [
      { path: '/s/1', title: 'Intro', section: 'Chapter 1' },
      { path: '/s/2', title: 'No Section' },
      { path: '/s/3', title: 'End', section: 'Chapter 2' },
    ];
    const results = searchSlides(mixedDeck, '');
    expect(results[0].section).toBe('Chapter 1');
    expect(results[1].section).toBeUndefined();
    expect(results[2].section).toBe('Chapter 2');
  });
});
