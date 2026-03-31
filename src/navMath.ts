export function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(index, count - 1));
}

export function nextIndex(current: number, direction: 'prev' | 'next', count: number): number {
  if (count <= 0) return 0;
  if (direction === 'next') return clampIndex(current + 1, count);
  return clampIndex(current - 1, count);
}
