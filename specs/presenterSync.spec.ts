// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createPresenterSync } from '../src/presenterSync';

type MockChannel = {
  postMessage: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  listeners: Map<string, ((e: MessageEvent) => void)[]>;
  simulateMessage(data: unknown): void;
};

function makeMockChannel(): MockChannel {
  const listeners: Map<string, ((e: MessageEvent) => void)[]> = new Map();
  return {
    postMessage: vi.fn(),
    close: vi.fn(),
    listeners,
    addEventListener: vi.fn((type: string, fn: (e: MessageEvent) => void) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type)!.push(fn);
    }),
    removeEventListener: vi.fn((type: string, fn: (e: MessageEvent) => void) => {
      const fns = listeners.get(type) ?? [];
      listeners.set(
        type,
        fns.filter((f) => f !== fn),
      );
    }),
    simulateMessage(data: unknown) {
      const fns = listeners.get('message') ?? [];
      fns.forEach((fn) => fn({ data } as MessageEvent));
    },
  };
}

beforeEach(() => {
  vi.stubGlobal(
    'BroadcastChannel',
    vi.fn(function () {
      return makeMockChannel();
    }),
  );
});

describe('createPresenterSync', () => {
  it('broadcasts a navigate message', () => {
    const sync = createPresenterSync('test-channel');
    sync.broadcast('/slide/2');
    const channel = (BroadcastChannel as ReturnType<typeof vi.fn>).mock.results[0]
      .value as MockChannel;
    expect(channel.postMessage).toHaveBeenCalledWith({
      type: 'navigate',
      path: '/slide/2',
    });
    sync.close();
  });

  it('calls subscriber when a navigate message arrives', () => {
    const sync = createPresenterSync('test-channel');
    const handler = vi.fn();
    const channel = (BroadcastChannel as ReturnType<typeof vi.fn>).mock.results[0]
      .value as MockChannel;
    sync.subscribe(handler);
    channel.simulateMessage({ type: 'navigate', path: '/slide/3' });
    expect(handler).toHaveBeenCalledWith('/slide/3');
    sync.close();
  });

  it('does not call subscriber after unsubscribe', () => {
    const sync = createPresenterSync('test-channel');
    const handler = vi.fn();
    const channel = (BroadcastChannel as ReturnType<typeof vi.fn>).mock.results[0]
      .value as MockChannel;
    const unsub = sync.subscribe(handler);
    unsub();
    channel.simulateMessage({ type: 'navigate', path: '/slide/4' });
    expect(handler).not.toHaveBeenCalled();
    sync.close();
  });

  it('ignores messages with unknown type', () => {
    const sync = createPresenterSync('test-channel');
    const handler = vi.fn();
    const channel = (BroadcastChannel as ReturnType<typeof vi.fn>).mock.results[0]
      .value as MockChannel;
    sync.subscribe(handler);
    channel.simulateMessage({ type: 'unknown', path: '/slide/1' });
    expect(handler).not.toHaveBeenCalled();
    sync.close();
  });

  it('close() closes the underlying channel', () => {
    const sync = createPresenterSync('test-channel');
    const channel = (BroadcastChannel as ReturnType<typeof vi.fn>).mock.results[0]
      .value as MockChannel;
    sync.close();
    expect(channel.close).toHaveBeenCalledOnce();
  });
});
