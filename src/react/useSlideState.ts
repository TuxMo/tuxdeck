import { useMemo } from 'react';
import type { SlideRef, SlideState } from '../types';
import { getSlideState } from '../slideState';

export function useSlideState(deck: readonly SlideRef[], pathname: string): SlideState {
  return useMemo(() => getSlideState(deck, pathname), [deck, pathname]);
}
