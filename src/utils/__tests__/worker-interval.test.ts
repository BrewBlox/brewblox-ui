import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Interval = typeof import('../worker-interval').workerInterval;

async function loadInterval(): Promise<Interval> {
  vi.resetModules();
  return (await import('../worker-interval')).workerInterval;
}

describe('workerInterval', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('uses the page timers without workers', async () => {
    vi.stubGlobal('Worker', undefined);
    vi.useFakeTimers();
    const interval = await loadInterval();
    const callback = vi.fn();

    const id = interval.set(callback, 100, 'arg');
    vi.advanceTimersByTime(350);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith('arg');

    interval.clear(id);
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  describe('with a worker', () => {
    let posted: any[];
    let fakeWorker: { onmessage: ((e: { data: number }) => void) | null };

    beforeEach(() => {
      posted = [];
      vi.stubGlobal(
        'Worker',
        class {
          onmessage: ((e: { data: number }) => void) | null = null;
          constructor() {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            fakeWorker = this;
          }
          postMessage(msg: any): void {
            posted.push(msg);
          }
        },
      );
      // jsdom has no object URLs
      URL.createObjectURL = () => 'blob:worker';
    });

    afterEach(() => {
      Reflect.deleteProperty(URL, 'createObjectURL');
    });

    it('calls back on ticks from the worker, and stops when cleared', async () => {
      const interval = await loadInterval();
      const first = vi.fn();
      const second = vi.fn();

      const id1 = interval.set(first, 1000, 'a');
      const id2 = interval.set(second, 5000);
      // Only the delay goes to the worker: no times cross over
      expect(posted).toEqual([
        { id: id1, delay: 1000 },
        { id: id2, delay: 5000 },
      ]);

      fakeWorker.onmessage!({ data: id1 });
      fakeWorker.onmessage!({ data: id1 });
      expect(first).toHaveBeenCalledTimes(2);
      expect(first).toHaveBeenCalledWith('a');
      expect(second).not.toHaveBeenCalled();

      interval.clear(id1);
      expect(posted.at(-1)).toEqual({ clear: id1 });
      // A tick already on its way is ignored
      fakeWorker.onmessage!({ data: id1 });
      expect(first).toHaveBeenCalledTimes(2);
    });
  });
});
