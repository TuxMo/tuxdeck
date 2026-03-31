// Types
export type { SlideRef, SlideSearchResult, SlideState } from './types';

// Pure logic
export { clampIndex, nextIndex } from './navMath';
export { searchSlides } from './searchSlides';
export { slideIndexForPath, slideNumberForPath } from './deckUtils';
export { getSlideState } from './slideState';
export { swipeDirection } from './swipeNav';
export { createPresenterSync } from './presenterSync';
export type { PresenterSync } from './presenterSync';
