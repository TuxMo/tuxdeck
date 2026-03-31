import { useEffect } from 'react';
import type { SlideRef } from '../types';
import { nextIndex } from '../navMath';
import { slideIndexForPath } from '../deckUtils';

function isInteractiveTarget(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
  return (e.target as HTMLElement)?.isContentEditable ?? false;
}

function toggleFullscreen(): void {
  const doc = document as Document & {
    fullscreenElement?: Element | null;
    exitFullscreen?: () => Promise<void>;
  };
  const el = document.documentElement as HTMLElement & {
    requestFullscreen?: () => Promise<void>;
  };
  if (doc.fullscreenElement) doc.exitFullscreen?.();
  else el.requestFullscreen?.();
}

export type UseKeyboardNavOptions = {
  deck: readonly SlideRef[];
  pathname: string;
  onNavigate: (path: string) => void;
  isDialogOpen: boolean;
  onOpenDialog: () => void;
};

/**
 * Registers global keyboard shortcuts for slide navigation:
 * - ArrowRight / ArrowLeft to navigate between slides
 * - "/" to open the jump-search dialog
 * - "f" to toggle fullscreen
 */
export function useKeyboardNav(opts: UseKeyboardNavOptions): void {
  const { deck, pathname, onNavigate, isDialogOpen, onOpenDialog } = opts;

  useEffect(() => {
    const currentIndex = slideIndexForPath(deck, pathname);

    function onKeyDown(e: KeyboardEvent) {
      if (isDialogOpen) return;
      if (isInteractiveTarget(e)) return;

      if (e.key === '/') {
        e.preventDefault();
        onOpenDialog();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate(deck[nextIndex(currentIndex, 'next', deck.length)].path);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate(deck[nextIndex(currentIndex, 'prev', deck.length)].path);
      }
      if (e.key.toLowerCase() === 'f') toggleFullscreen();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deck, pathname, isDialogOpen, onNavigate, onOpenDialog]);
}
