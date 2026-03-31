import { useEffect, useRef } from 'react';
import type { SlideRef } from '../types';
import { nextIndex } from '../navMath';
import { slideIndexForPath } from '../deckUtils';
import { swipeDirection } from '../swipeNav';

export type UseSwipeNavOptions = {
  deck: readonly SlideRef[];
  pathname: string;
  onNavigate: (path: string) => void;
  threshold?: number; // minimum px delta to register as a swipe; default 50
};

export function useSwipeNav(opts: UseSwipeNavOptions): void {
  const { deck, pathname, onNavigate, threshold = 50 } = opts;
  const startXRef = useRef<number | null>(null);

  useEffect(() => {
    if (deck.length === 0) return;
    const currentIndex = slideIndexForPath(deck, pathname);

    function onTouchStart(e: TouchEvent) {
      startXRef.current = e.touches[0].clientX;
    }

    function onTouchEnd(e: TouchEvent) {
      if (startXRef.current === null) return;
      const deltaX = e.changedTouches[0].clientX - startXRef.current;
      startXRef.current = null;
      const direction = swipeDirection(deltaX, threshold);
      if (direction === null) return;
      onNavigate(deck[nextIndex(currentIndex, direction, deck.length)].path);
    }

    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [deck, pathname, onNavigate, threshold]);
}
