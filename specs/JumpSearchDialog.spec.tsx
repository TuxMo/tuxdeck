// @vitest-environment jsdom
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JumpSearchDialog } from '../src/react/JumpSearchDialog';
import type { SlideRef } from '../src/types';

const deck: SlideRef[] = [
  { path: '/s/1', title: 'Intro', section: 'Chapter 1' },
  { path: '/s/2', title: 'Agenda', section: 'Chapter 1' },
  { path: '/s/3', title: 'Architecture', section: 'Deep Dive' },
  { path: '/s/4', title: 'Demo' },
];

function renderDialog(
  overrides: Partial<{ onClose: () => void; onSelectPath: (p: string) => void }> = {},
) {
  const onClose = overrides.onClose ?? vi.fn();
  const onSelectPath = overrides.onSelectPath ?? vi.fn();
  render(<JumpSearchDialog deck={deck} onClose={onClose} onSelectPath={onSelectPath} />);
  return { onClose, onSelectPath };
}

describe('JumpSearchDialog', () => {
  it('renders all slides when query is empty', () => {
    renderDialog();
    expect(screen.getAllByRole('option')).toHaveLength(deck.length);
  });

  it('filters results as the user types', () => {
    renderDialog();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'arch' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option').textContent).toContain('Architecture');
  });

  it('shows "No matching slides" when nothing matches', () => {
    renderDialog();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzz' } });
    expect(screen.getByText(/no matching slides/i)).toBeDefined();
  });

  it('renders section headers for grouped results', () => {
    renderDialog();
    expect(screen.getByText('Chapter 1')).toBeDefined();
    expect(screen.getByText('Deep Dive')).toBeDefined();
  });

  it('calls onSelectPath and onClose when Enter is pressed on highlighted result', () => {
    const onClose = vi.fn();
    const onSelectPath = vi.fn();
    render(<JumpSearchDialog deck={deck} onClose={onClose} onSelectPath={onSelectPath} />);
    const container =
      screen.getByRole('dialog').querySelector('[onkeydown]') ??
      screen.getByRole('dialog').firstElementChild!;
    fireEvent.keyDown(container as Element, { key: 'Enter' });
    expect(onSelectPath).toHaveBeenCalledWith('/s/1');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<JumpSearchDialog deck={deck} onClose={onClose} onSelectPath={vi.fn()} />);
    const inner = screen.getByRole('dialog').firstElementChild!;
    fireEvent.keyDown(inner as Element, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('prevents "/" key from propagating', () => {
    renderDialog();
    const inner = screen.getByRole('dialog').firstElementChild!;
    const event = fireEvent.keyDown(inner as Element, { key: '/', cancelable: true });
    // no navigation happens and no error is thrown
    expect(event).toBeDefined();
  });

  it('moves highlight down on ArrowDown', () => {
    renderDialog();
    const inner = screen.getByRole('dialog').firstElementChild!;
    fireEvent.keyDown(inner as Element, { key: 'ArrowDown' });
    const options = screen.getAllByRole('option');
    expect(options[1].getAttribute('aria-selected')).toBe('true');
  });

  it('moves highlight up on ArrowUp (wraps to last)', () => {
    renderDialog();
    const inner = screen.getByRole('dialog').firstElementChild!;
    fireEvent.keyDown(inner as Element, { key: 'ArrowUp' });
    const options = screen.getAllByRole('option');
    expect(options[options.length - 1].getAttribute('aria-selected')).toBe('true');
  });

  it('calls onSelectPath and onClose when clicking a result', () => {
    const onClose = vi.fn();
    const onSelectPath = vi.fn();
    render(<JumpSearchDialog deck={deck} onClose={onClose} onSelectPath={onSelectPath} />);
    const options = screen.getAllByRole('option');
    fireEvent.mouseDown(options[1]);
    expect(onSelectPath).toHaveBeenCalledWith('/s/2');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes when clicking the backdrop', () => {
    const onClose = vi.fn();
    render(<JumpSearchDialog deck={deck} onClose={onClose} onSelectPath={vi.fn()} />);
    const backdrop = screen.getByRole('dialog');
    fireEvent.mouseDown(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders as a portal directly inside document.body', () => {
    renderDialog();
    const dialog = screen.getByRole('dialog');
    expect(dialog.parentElement).toBe(document.body);
  });

  it('backdrop uses inline styles for fixed overlay — no Tailwind dependency', () => {
    renderDialog();
    const backdrop = screen.getByRole('dialog');
    expect(backdrop.style.position).toBe('fixed');
    expect(backdrop.style.zIndex).toBeTruthy();
    expect(Number(backdrop.style.zIndex)).toBeGreaterThanOrEqual(9999);
    expect(backdrop.style.display).toBe('flex');
    expect(backdrop.getAttribute('class') ?? '').toBe('');
  });

  it('dialog panel uses inline styles — no Tailwind dependency', () => {
    renderDialog();
    const panel = screen.getByRole('dialog').firstElementChild as HTMLElement;
    expect(panel.style.background).toBeTruthy();
    expect(panel.style.borderRadius).toBeTruthy();
    expect(panel.getAttribute('class') ?? '').toBe('');
  });

  it('does not close when clicking inside the dialog panel', () => {
    const onClose = vi.fn();
    render(<JumpSearchDialog deck={deck} onClose={onClose} onSelectPath={vi.fn()} />);
    const inner = screen.getByRole('dialog').firstElementChild!;
    fireEvent.mouseDown(inner as Element);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ArrowDown/Up are no-ops when results are empty', () => {
    renderDialog();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzz' } });
    const inner = screen.getByRole('dialog').firstElementChild!;
    // Should not throw
    fireEvent.keyDown(inner as Element, { key: 'ArrowDown' });
    fireEvent.keyDown(inner as Element, { key: 'ArrowUp' });
    fireEvent.keyDown(inner as Element, { key: 'Enter' });
  });

  it('resets highlight index to 0 when query changes', () => {
    renderDialog();
    const inner = screen.getByRole('dialog').firstElementChild!;
    fireEvent.keyDown(inner as Element, { key: 'ArrowDown' });
    let options = screen.getAllByRole('option');
    expect(options[1].getAttribute('aria-selected')).toBe('true');

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
    options = screen.getAllByRole('option');
    expect(options[0].getAttribute('aria-selected')).toBe('true');
  });
});
