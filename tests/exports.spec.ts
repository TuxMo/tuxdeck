import { describe, expect, it } from 'vitest';
import * as rootExports from '../src/index';
import * as reactExports from '../src/react/index';

describe('src/index re-exports', () => {
  it('exports all expected public API members', () => {
    expect(typeof rootExports.clampIndex).toBe('function');
    expect(typeof rootExports.nextIndex).toBe('function');
    expect(typeof rootExports.searchSlides).toBe('function');
    expect(typeof rootExports.slideIndexForPath).toBe('function');
    expect(typeof rootExports.slideNumberForPath).toBe('function');
    expect(typeof rootExports.getSlideState).toBe('function');
    expect(typeof rootExports.swipeDirection).toBe('function');
    expect(typeof rootExports.createPresenterSync).toBe('function');
  });
});

describe('src/react/index re-exports', () => {
  it('exports all expected React API members', () => {
    expect(typeof reactExports.PresentationShell).toBe('function');
    expect(typeof reactExports.JumpSearchDialog).toBe('function');
    expect(typeof reactExports.useKeyboardNav).toBe('function');
    expect(typeof reactExports.useSlideState).toBe('function');
    expect(typeof reactExports.useSwipeNav).toBe('function');
    expect(typeof reactExports.usePresenterSync).toBe('function');
  });
});
