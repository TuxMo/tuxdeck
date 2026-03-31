// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardNav } from '../src/react/useKeyboardNav';
import type { SlideRef } from '../src/types';

const deck: SlideRef[] = [
  { path: '/s/1', title: 'Intro' },
  { path: '/s/2', title: 'Body' },
  { path: '/s/3', title: 'End' },
];

function fireKey(key: string, target?: EventTarget) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  if (target) {
    Object.defineProperty(event, 'target', { value: target });
  }
  window.dispatchEvent(event);
  return event;
}

describe('useKeyboardNav', () => {
  let onNavigate: ReturnType<typeof vi.fn>;
  let onOpenDialog: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onNavigate = vi.fn();
    onOpenDialog = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('navigates forward on ArrowRight', () => {
    renderHook(() =>
      useKeyboardNav({ deck, pathname: '/s/1', onNavigate, isDialogOpen: false, onOpenDialog }),
    );
    fireKey('ArrowRight');
    expect(onNavigate).toHaveBeenCalledWith('/s/2');
  });

  it('navigates backward on ArrowLeft', () => {
    renderHook(() =>
      useKeyboardNav({ deck, pathname: '/s/2', onNavigate, isDialogOpen: false, onOpenDialog }),
    );
    fireKey('ArrowLeft');
    expect(onNavigate).toHaveBeenCalledWith('/s/1');
  });

  it('clamps at first slide on ArrowLeft', () => {
    renderHook(() =>
      useKeyboardNav({ deck, pathname: '/s/1', onNavigate, isDialogOpen: false, onOpenDialog }),
    );
    fireKey('ArrowLeft');
    expect(onNavigate).toHaveBeenCalledWith('/s/1');
  });

  it('clamps at last slide on ArrowRight', () => {
    renderHook(() =>
      useKeyboardNav({ deck, pathname: '/s/3', onNavigate, isDialogOpen: false, onOpenDialog }),
    );
    fireKey('ArrowRight');
    expect(onNavigate).toHaveBeenCalledWith('/s/3');
  });

  it('opens dialog on "/" key', () => {
    renderHook(() =>
      useKeyboardNav({ deck, pathname: '/s/1', onNavigate, isDialogOpen: false, onOpenDialog }),
    );
    fireKey('/');
    expect(onOpenDialog).toHaveBeenCalledOnce();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('ignores all keys when dialog is open', () => {
    renderHook(() =>
      useKeyboardNav({ deck, pathname: '/s/1', onNavigate, isDialogOpen: true, onOpenDialog }),
    );
    fireKey('ArrowRight');
    fireKey('/');
    expect(onNavigate).not.toHaveBeenCalled();
    expect(onOpenDialog).not.toHaveBeenCalled();
  });

  it('ignores keys when target is an INPUT', () => {
    renderHook(() =>
      useKeyboardNav({ deck, pathname: '/s/1', onNavigate, isDialogOpen: false, onOpenDialog }),
    );
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    document.body.removeChild(input);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('ignores keys when target is a TEXTAREA', () => {
    renderHook(() =>
      useKeyboardNav({ deck, pathname: '/s/1', onNavigate, isDialogOpen: false, onOpenDialog }),
    );
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    document.body.removeChild(textarea);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('ignores keys when target is contentEditable', () => {
    renderHook(() =>
      useKeyboardNav({ deck, pathname: '/s/1', onNavigate, isDialogOpen: false, onOpenDialog }),
    );
    const div = document.createElement('div');
    // JSDOM does not implement isContentEditable, so stub it
    Object.defineProperty(div, 'isContentEditable', { get: () => true, configurable: true });
    document.body.appendChild(div);
    div.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    document.body.removeChild(div);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('calls toggleFullscreen on "f" key', () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: requestFullscreen,
      configurable: true,
    });
    renderHook(() =>
      useKeyboardNav({ deck, pathname: '/s/1', onNavigate, isDialogOpen: false, onOpenDialog }),
    );
    fireKey('f');
    expect(requestFullscreen).toHaveBeenCalled();
  });

  it('calls exitFullscreen on "F" key when already fullscreen', () => {
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);
    const fakeEl = document.createElement('div');
    Object.defineProperty(document, 'fullscreenElement', {
      value: fakeEl,
      configurable: true,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      value: exitFullscreen,
      configurable: true,
    });
    renderHook(() =>
      useKeyboardNav({ deck, pathname: '/s/1', onNavigate, isDialogOpen: false, onOpenDialog }),
    );
    fireKey('F');
    expect(exitFullscreen).toHaveBeenCalled();
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
  });

  it('removes listener on unmount', () => {
    const { unmount } = renderHook(() =>
      useKeyboardNav({ deck, pathname: '/s/1', onNavigate, isDialogOpen: false, onOpenDialog }),
    );
    unmount();
    fireKey('ArrowRight');
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
