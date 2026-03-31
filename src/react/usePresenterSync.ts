import { useCallback, useEffect, useRef } from 'react';
import { createPresenterSync } from '../presenterSync';
import type { PresenterSync } from '../presenterSync';

export type UsePresenterSyncOptions = {
  channelName: string;
  role: 'presenter' | 'audience';
  onNavigate: (path: string) => void; // called only when role === "audience"
};

export type UsePresenterSyncResult = {
  broadcast: (path: string) => void; // no-op when role === "audience"
};

export function usePresenterSync(opts: UsePresenterSyncOptions): UsePresenterSyncResult {
  const { channelName, role, onNavigate } = opts;
  const syncRef = useRef<PresenterSync | null>(null);
  // Hold latest onNavigate in a ref so the channel effect does not need to
  // re-run (and tear down the BroadcastChannel) whenever the caller passes a
  // new function identity.
  const onNavigateRef = useRef(onNavigate);
  useEffect(() => {
    onNavigateRef.current = onNavigate;
  });

  useEffect(() => {
    const sync = createPresenterSync(channelName);
    syncRef.current = sync;
    let unsub: (() => void) | undefined;
    if (role === 'audience') {
      unsub = sync.subscribe((path) => onNavigateRef.current(path));
    }
    return () => {
      unsub?.();
      sync.close();
      syncRef.current = null;
    };
  }, [channelName, role]); // onNavigate intentionally excluded — see onNavigateRef above

  const broadcast = useCallback((path: string) => {
    syncRef.current?.broadcast(path);
  }, []);

  return { broadcast };
}
