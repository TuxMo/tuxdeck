import type { SlideRef } from './types';

export function slideIndexForPath(deck: readonly SlideRef[], pathname: string): number {
  const index = deck.findIndex((s) => s.path === pathname);
  return index === -1 ? 0 : index;
}

export function slideNumberForPath(deck: readonly SlideRef[], pathname: string): number | null {
  const index = deck.findIndex((s) => s.path === pathname);
  return index === -1 ? null : index + 1;
}
