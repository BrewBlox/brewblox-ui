import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrewbloxEventbus } from '@/eventbus';
import { notify } from '@/utils/notify';

const mocks = vi.hoisted(() => ({
  handlers: {} as Record<string, (...args: unknown[]) => void>,
  ack: () => {},
}));

vi.mock('mqtt', () => ({
  default: {
    connect: () => ({
      on: (event: string, cb: (...args: unknown[]) => void) => {
        mocks.handlers[event] = cb;
      },
      subscribe: (_: unknown, cb: () => void) => {
        mocks.ack = cb;
      },
      end: () => {},
      connected: false,
    }),
  },
}));

describe('BrewbloxEventbus', () => {
  beforeEach(() => {
    mocks.handlers = {};
  });

  it('calls back on every connect, once the subscriptions are acknowledged', async () => {
    const bus = new BrewbloxEventbus();
    const cb = vi.fn();
    bus.subscribe('brewcast/datastore/ns');
    bus.onConnect(cb);
    await bus.connect();
    const settle = (): Promise<void> => new Promise((r) => setTimeout(r));

    mocks.handlers.connect();
    await settle();
    expect(cb).not.toHaveBeenCalled();
    mocks.ack();
    await settle();
    expect(cb).toHaveBeenCalledTimes(1);

    mocks.handlers.close();
    mocks.handlers.connect();
    mocks.ack();
    await settle();
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('reports a connect callback that fails', async () => {
    const error = vi.spyOn(notify, 'error').mockImplementation(() => {});
    const bus = new BrewbloxEventbus();
    bus.onConnect(() => Promise.reject(new Error('callback error')));
    await bus.connect();

    mocks.handlers.connect();
    await new Promise((r) => setTimeout(r));
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
