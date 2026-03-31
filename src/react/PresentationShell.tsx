import { useCallback, useState } from 'react';
import type { SlideRef } from '../types';
import { useKeyboardNav } from './useKeyboardNav';
import { useSwipeNav } from './useSwipeNav';
import { JumpSearchDialog } from './JumpSearchDialog';

export type PresentationShellProps = {
  deck: readonly SlideRef[];
  pathname: string;
  onNavigate: (path: string) => void;
  enableSwipe?: boolean; // default false
  children: React.ReactNode;
};

export function PresentationShell({
  deck,
  pathname,
  onNavigate,
  enableSwipe = false,
  children,
}: PresentationShellProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openDialog = useCallback(() => setIsDialogOpen(true), []);

  useKeyboardNav({
    deck,
    pathname,
    onNavigate,
    isDialogOpen,
    onOpenDialog: openDialog,
  });

  useSwipeNav(enableSwipe ? { deck, pathname, onNavigate } : { deck: [], pathname, onNavigate });

  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
      {isDialogOpen && (
        <JumpSearchDialog
          deck={deck}
          onClose={() => setIsDialogOpen(false)}
          onSelectPath={onNavigate}
        />
      )}
    </div>
  );
}
