// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePresenterSync } from '../src/react/usePresenterSync';

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

describe('usePresenterSync — presenter role', () => {
  it('broadcasts a path via the returned broadcast function', () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      usePresenterSync({ channelName: 'deck', role: 'presenter', onNavigate }),
    );
    act(() => result.current.broadcast('/s/2'));
    const channel = (BroadcastChannel as ReturnType<typeof vi.fn>).mock.results[0]
      .value as MockChannel;
    expect(channel.postMessage).toHaveBeenCalledWith({ type: 'navigate', path: '/s/2' });
  });

  it('does not subscribe to incoming messages when presenter', () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      usePresenterSync({ channelName: 'deck', role: 'presenter', onNavigate }),
    );
    const channel = (BroadcastChannel as ReturnType<typeof vi.fn>).mock.results[0]
      .value as MockChannel;
    channel.simulateMessage({ type: 'navigate', path: '/s/3' });
    expect(onNavigate).not.toHaveBeenCalled();
    act(() => result.current.broadcast('/s/1')); // keep result used
  });
});

describe('usePresenterSync — audience role', () => {
  it('calls onNavigate when a navigate message arrives', () => {
    const onNavigate = vi.fn();
    renderHook(() => usePresenterSync({ channelName: 'deck', role: 'audience', onNavigate }));
    const channel = (BroadcastChannel as ReturnType<typeof vi.fn>).mock.results[0]
      .value as MockChannel;
    act(() => channel.simulateMessage({ type: 'navigate', path: '/s/4' }));
    expect(onNavigate).toHaveBeenCalledWith('/s/4');
  });

  it('picks up an updated onNavigate without re-creating the channel', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ cb }: { cb: (p: string) => void }) =>
        usePresenterSync({ channelName: 'deck', role: 'audience', onNavigate: cb }),
      { initialProps: { cb: first } },
    );
    rerender({ cb: second });
    const channel = (BroadcastChannel as ReturnType<typeof vi.fn>).mock.results[0]
      .value as MockChannel;
    // Only one BroadcastChannel should have been created
    expect((BroadcastChannel as ReturnType<typeof vi.fn>).mock.results).toHaveLength(1);
    act(() => channel.simulateMessage({ type: 'navigate', path: '/s/5' }));
    expect(second).toHaveBeenCalledWith('/s/5');
    expect(first).not.toHaveBeenCalled();
  });
});

describe('usePresenterSync — cleanup', () => {
  it('closes the channel on unmount', () => {
    const { unmount } = renderHook(() =>
      usePresenterSync({ channelName: 'deck', role: 'presenter', onNavigate: vi.fn() }),
    );
    const channel = (BroadcastChannel as ReturnType<typeof vi.fn>).mock.results[0]
      .value as MockChannel;
    unmount();
    expect(channel.close).toHaveBeenCalledOnce();
  });

  it('broadcast is a no-op after unmount', () => {
    const { result, unmount } = renderHook(() =>
      usePresenterSync({ channelName: 'deck', role: 'presenter', onNavigate: vi.fn() }),
    );
    unmount();
    // Should not throw
    act(() => result.current.broadcast('/s/1'));
  });
});
