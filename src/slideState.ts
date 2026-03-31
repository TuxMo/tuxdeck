import type { SlideRef, SlideState } from './types';
import { slideIndexForPath } from './deckUtils';

export function getSlideState(deck: readonly SlideRef[], pathname: string): SlideState {
  const currentIndex = slideIndexForPath(deck, pathname);
  return {
    currentIndex,
    total: deck.length,
    isFirst: currentIndex === 0,
    isLast: deck.length === 0 || currentIndex === deck.length - 1,
    current: deck[currentIndex] ?? null,
  };
}
