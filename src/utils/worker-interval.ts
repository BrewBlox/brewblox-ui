/**
 * setInterval and clearInterval, run by a worker.
 *
 * The eventbus needs its keepalive on time, and browsers slow down the timers
 * of a hidden page, but not those of a worker.
 * The worker timers that mqtt brings (worker-timers 8) compute their deadlines
 * from the page's and the worker's clocks. When the device slept, or its clock
 * jumped, between loading the page and the first eventbus connection,
 * those clocks differ, and every keepalive fires at once: a reconnect loop.
 * This worker keeps its own intervals and only posts ticks: no time crosses over.
 *
 * Without workers (tests), or if one can not start, the page's timers are used.
 */

const WORKER_SOURCE = `
const intervals = new Map();
onmessage = ({ data }) => {
  if (data.clear != null) {
    clearInterval(intervals.get(data.clear));
    intervals.delete(data.clear);
  } else {
    intervals.set(data.id, setInterval(() => postMessage(data.id), data.delay));
  }
};
`;

type Callback = (...args: any[]) => void;

let worker: Worker | null | undefined;
const callbacks = new Map<number, () => void>();
let lastId = 0;

function intervalWorker(): Worker | null {
  if (worker === undefined) {
    worker = null;
    if (typeof Worker !== 'undefined') {
      try {
        const url = URL.createObjectURL(
          new Blob([WORKER_SOURCE], { type: 'text/javascript' }),
        );
        worker = new Worker(url);
        worker.onmessage = ({ data }) => callbacks.get(data)?.();
      } catch {
        worker = null;
      }
    }
  }
  return worker;
}

export const workerInterval = {
  set(callback: Callback, delay = 0, ...args: any[]): number {
    const w = intervalWorker();
    if (w == null) {
      return window.setInterval(callback, delay, ...args);
    }
    const id = ++lastId;
    callbacks.set(id, () => callback(...args));
    w.postMessage({ id, delay });
    return id;
  },

  clear(id?: number): void {
    if (id == null) {
      return;
    }
    const w = intervalWorker();
    if (w == null) {
      window.clearInterval(id);
      return;
    }
    callbacks.delete(id);
    w.postMessage({ clear: id });
  },
};
