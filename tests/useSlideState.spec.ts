// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSlideState } from '../src/react/useSlideState';
import type { SlideRef } from '../src/types';

const deck: SlideRef[] = [
  { path: '/s/1', title: 'Intro' },
  { path: '/s/2', title: 'Body' },
  { path: '/s/3', title: 'End' },
];

describe('useSlideState', () => {
  it('returns slide state for a known path', () => {
    const { result } = renderHook(() => useSlideState(deck, '/s/1'));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.total).toBe(3);
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(false);
    expect(result.current.current).toEqual(deck[0]);
  });

  it('returns updated state when pathname changes', () => {
    const { result, rerender } = renderHook(
      ({ path }: { path: string }) => useSlideState(deck, path),
      { initialProps: { path: '/s/1' } },
    );
    rerender({ path: '/s/3' });
    expect(result.current.currentIndex).toBe(2);
    expect(result.current.isLast).toBe(true);
  });

  it('returns updated state when deck changes', () => {
    const smallDeck: SlideRef[] = [{ path: '/s/1', title: 'Only' }];
    const { result, rerender } = renderHook(
      ({ d }: { d: readonly SlideRef[] }) => useSlideState(d, '/s/1'),
      { initialProps: { d: deck } },
    );
    rerender({ d: smallDeck });
    expect(result.current.total).toBe(1);
    expect(result.current.isLast).toBe(true);
  });
});
