import { describe, expect, it } from 'vitest';
import { getSlideState } from '../src/slideState';
import type { SlideRef } from '../src/types';

const deck: SlideRef[] = [
  { path: '/s/1', title: 'Intro' },
  { path: '/s/2', title: 'Body' },
  { path: '/s/3', title: 'End' },
];

describe('getSlideState', () => {
  it('returns correct state for the first slide', () => {
    const state = getSlideState(deck, '/s/1');
    expect(state.currentIndex).toBe(0);
    expect(state.total).toBe(3);
    expect(state.isFirst).toBe(true);
    expect(state.isLast).toBe(false);
    expect(state.current).toEqual(deck[0]);
  });

  it('returns correct state for the last slide', () => {
    const state = getSlideState(deck, '/s/3');
    expect(state.currentIndex).toBe(2);
    expect(state.isFirst).toBe(false);
    expect(state.isLast).toBe(true);
    expect(state.current).toEqual(deck[2]);
  });

  it('returns correct state for a middle slide', () => {
    const state = getSlideState(deck, '/s/2');
    expect(state.currentIndex).toBe(1);
    expect(state.isFirst).toBe(false);
    expect(state.isLast).toBe(false);
  });

  it('falls back to index 0 for unknown path', () => {
    const state = getSlideState(deck, '/s/unknown');
    expect(state.currentIndex).toBe(0);
    expect(state.current).toEqual(deck[0]);
  });

  it('handles empty deck', () => {
    const state = getSlideState([], '/s/1');
    expect(state.currentIndex).toBe(0);
    expect(state.total).toBe(0);
    expect(state.isFirst).toBe(true);
    expect(state.isLast).toBe(true);
    expect(state.current).toBeNull();
  });
});
