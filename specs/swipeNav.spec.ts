// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { swipeDirection } from '../src/swipeNav';

describe('swipeDirection', () => {
  it('returns null when delta is below threshold', () => {
    expect(swipeDirection(30, 50)).toBeNull();
    expect(swipeDirection(-30, 50)).toBeNull();
    expect(swipeDirection(0, 50)).toBeNull();
  });

  it("returns 'next' for a left swipe (negative delta)", () => {
    expect(swipeDirection(-60, 50)).toBe('next');
    expect(swipeDirection(-100, 50)).toBe('next');
  });

  it("returns 'prev' for a right swipe (positive delta)", () => {
    expect(swipeDirection(60, 50)).toBe('prev');
    expect(swipeDirection(100, 50)).toBe('prev');
  });

  it('uses custom threshold', () => {
    expect(swipeDirection(20, 10)).toBe('prev');
    expect(swipeDirection(5, 10)).toBeNull();
  });
});
