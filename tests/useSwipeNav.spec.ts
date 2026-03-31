// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSwipeNav } from '../src/react/useSwipeNav';
import type { SlideRef } from '../src/types';

const deck: SlideRef[] = [
  { path: '/s/1', title: 'Intro' },
  { path: '/s/2', title: 'Body' },
  { path: '/s/3', title: 'End' },
];

function fireTouchStart(clientX: number) {
  window.dispatchEvent(
    new TouchEvent('touchstart', {
      touches: [{ clientX } as Touch],
      bubbles: true,
    }),
  );
}

function fireTouchEnd(clientX: number) {
  window.dispatchEvent(
    new TouchEvent('touchend', {
      changedTouches: [{ clientX } as Touch],
      bubbles: true,
    }),
  );
}

describe('useSwipeNav', () => {
  let onNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onNavigate = vi.fn();
  });

  it('navigates to next slide on left swipe', () => {
    renderHook(() => useSwipeNav({ deck, pathname: '/s/1', onNavigate }));
    fireTouchStart(200);
    fireTouchEnd(100); // deltaX = -100, exceeds default 50 threshold → next
    expect(onNavigate).toHaveBeenCalledWith('/s/2');
  });

  it('navigates to previous slide on right swipe', () => {
    renderHook(() => useSwipeNav({ deck, pathname: '/s/2', onNavigate }));
    fireTouchStart(100);
    fireTouchEnd(200); // deltaX = +100 → prev
    expect(onNavigate).toHaveBeenCalledWith('/s/1');
  });

  it('does not navigate when swipe is below threshold', () => {
    renderHook(() => useSwipeNav({ deck, pathname: '/s/1', onNavigate }));
    fireTouchStart(100);
    fireTouchEnd(110); // deltaX = +10, below default 50
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('respects a custom threshold', () => {
    renderHook(() => useSwipeNav({ deck, pathname: '/s/1', onNavigate, threshold: 200 }));
    fireTouchStart(200);
    fireTouchEnd(100); // deltaX = -100, below 200 threshold
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('does nothing when touchend fires without prior touchstart', () => {
    renderHook(() => useSwipeNav({ deck, pathname: '/s/1', onNavigate }));
    fireTouchEnd(100);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('does nothing for an empty deck', () => {
    renderHook(() => useSwipeNav({ deck: [], pathname: '/s/1', onNavigate }));
    fireTouchStart(200);
    fireTouchEnd(100);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('removes listeners on unmount', () => {
    const { unmount } = renderHook(() => useSwipeNav({ deck, pathname: '/s/1', onNavigate }));
    unmount();
    fireTouchStart(200);
    fireTouchEnd(100);
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
