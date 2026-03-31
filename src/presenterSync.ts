type SyncMessage = { type: 'navigate'; path: string };

export type PresenterSync = {
  broadcast(path: string): void;
  subscribe(handler: (path: string) => void): () => void;
  close(): void;
};

export function createPresenterSync(channelName: string): PresenterSync {
  const channel = new BroadcastChannel(channelName);

  return {
    broadcast(path: string) {
      channel.postMessage({ type: 'navigate', path } satisfies SyncMessage);
    },
    subscribe(handler: (path: string) => void) {
      const listener = (e: MessageEvent<SyncMessage>) => {
        if (e.data?.type === 'navigate') handler(e.data.path);
      };
      channel.addEventListener('message', listener);
      return () => channel.removeEventListener('message', listener);
    },
    close() {
      channel.close();
    },
  };
}
