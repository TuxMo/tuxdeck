// @vitest-environment jsdom
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PresentationShell } from '../src/react/PresentationShell';
import type { SlideRef } from '../src/types';

const deck: SlideRef[] = [
  { path: '/s/1', title: 'Intro' },
  { path: '/s/2', title: 'Body' },
  { path: '/s/3', title: 'End' },
];

describe('PresentationShell', () => {
  it('renders children', () => {
    render(
      <PresentationShell deck={deck} pathname="/s/1" onNavigate={vi.fn()}>
        <div>slide content</div>
      </PresentationShell>,
    );
    expect(screen.getByText('slide content')).toBeDefined();
  });

  it('wrapper uses inline minHeight style — no Tailwind dependency', () => {
    const { container } = render(
      <PresentationShell deck={deck} pathname="/s/1" onNavigate={vi.fn()}>
        <div>content</div>
      </PresentationShell>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.minHeight).toBe('100vh');
    expect(wrapper.getAttribute('class') ?? '').toBe('');
  });

  it('opens JumpSearchDialog on "/" key press', () => {
    render(
      <PresentationShell deck={deck} pathname="/s/1" onNavigate={vi.fn()}>
        <div>content</div>
      </PresentationShell>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.keyDown(window, { key: '/' });
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('closes dialog when JumpSearchDialog calls onClose', () => {
    render(
      <PresentationShell deck={deck} pathname="/s/1" onNavigate={vi.fn()}>
        <div>content</div>
      </PresentationShell>,
    );
    fireEvent.keyDown(window, { key: '/' });
    expect(screen.getByRole('dialog')).toBeDefined();
    // Press Escape inside the dialog to close
    const inner = screen.getByRole('dialog').firstElementChild!;
    fireEvent.keyDown(inner as Element, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('navigates via keyboard ArrowRight', () => {
    const onNavigate = vi.fn();
    render(
      <PresentationShell deck={deck} pathname="/s/1" onNavigate={onNavigate}>
        <div>content</div>
      </PresentationShell>,
    );
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onNavigate).toHaveBeenCalledWith('/s/2');
  });

  it('enables swipe navigation when enableSwipe is true', () => {
    const onNavigate = vi.fn();
    render(
      <PresentationShell deck={deck} pathname="/s/1" onNavigate={onNavigate} enableSwipe>
        <div>content</div>
      </PresentationShell>,
    );
    window.dispatchEvent(
      new TouchEvent('touchstart', { touches: [{ clientX: 200 } as Touch], bubbles: true }),
    );
    window.dispatchEvent(
      new TouchEvent('touchend', { changedTouches: [{ clientX: 100 } as Touch], bubbles: true }),
    );
    expect(onNavigate).toHaveBeenCalledWith('/s/2');
  });

  it('disables swipe navigation by default', () => {
    const onNavigate = vi.fn();
    render(
      <PresentationShell deck={deck} pathname="/s/1" onNavigate={onNavigate}>
        <div>content</div>
      </PresentationShell>,
    );
    window.dispatchEvent(
      new TouchEvent('touchstart', { touches: [{ clientX: 200 } as Touch], bubbles: true }),
    );
    window.dispatchEvent(
      new TouchEvent('touchend', { changedTouches: [{ clientX: 100 } as Touch], bubbles: true }),
    );
    // Keyboard nav fires, swipe should not
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('navigates via JumpSearchDialog selection', () => {
    const onNavigate = vi.fn();
    render(
      <PresentationShell deck={deck} pathname="/s/1" onNavigate={onNavigate}>
        <div>content</div>
      </PresentationShell>,
    );
    fireEvent.keyDown(window, { key: '/' });
    const options = screen.getAllByRole('option');
    fireEvent.mouseDown(options[1]);
    expect(onNavigate).toHaveBeenCalledWith('/s/2');
  });
});
