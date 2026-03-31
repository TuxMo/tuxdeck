export function swipeDirection(deltaX: number, threshold: number): 'next' | 'prev' | null {
  if (Math.abs(deltaX) < threshold) return null;
  return deltaX < 0 ? 'next' : 'prev';
}
