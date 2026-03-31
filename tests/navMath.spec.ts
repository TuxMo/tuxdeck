import { describe, expect, it } from 'vitest';
import { clampIndex, nextIndex } from '../src/navMath';

describe('clampIndex', () => {
  it('clamps within valid range', () => {
    expect(clampIndex(-1, 5)).toBe(0);
    expect(clampIndex(0, 5)).toBe(0);
    expect(clampIndex(4, 5)).toBe(4);
    expect(clampIndex(10, 5)).toBe(4);
  });

  it('returns 0 when count is 0', () => {
    expect(clampIndex(3, 0)).toBe(0);
  });
});

describe('nextIndex', () => {
  it('clamps at first/last slide', () => {
    expect(nextIndex(0, 'prev', 3)).toBe(0);
    expect(nextIndex(2, 'next', 3)).toBe(2);
  });

  it('advances forward', () => {
    expect(nextIndex(0, 'next', 3)).toBe(1);
    expect(nextIndex(1, 'next', 3)).toBe(2);
  });

  it('advances backward', () => {
    expect(nextIndex(2, 'prev', 3)).toBe(1);
    expect(nextIndex(1, 'prev', 3)).toBe(0);
  });

  it('returns 0 for empty deck', () => {
    expect(nextIndex(0, 'next', 0)).toBe(0);
    expect(nextIndex(0, 'prev', 0)).toBe(0);
  });
});
