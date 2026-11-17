import { AxiosError } from 'axios';
import { StoreObject } from 'brewblox-proto/ts';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { database } from '@/database';
import { BrewbloxRedisDatabase } from '@/database/database';
import { eventbus, EventCallback } from '@/eventbus';
import { http } from '@/utils/http';
import { notify } from '@/utils/notify';

describe('datastore errors', () => {
  const error = new AxiosError('Network Error');

  beforeEach(() => {
    vi.spyOn(notify, 'error').mockImplementation(() => {});
    vi.spyOn(http, 'post').mockRejectedValue(error);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const shown = (): unknown[] =>
    vi.mocked(notify.error).mock.calls.map(([, opts]) => opts?.shown);

  it('shows a failed write: its change is lost', async () => {
    const obj = { id: 'w', namespace: 'ns' };
    await expect(database.persist('ns', obj)).rejects.toBe(error);
    await expect(database.persistMult('ns', [obj])).rejects.toBe(error);
    await expect(database.remove('ns', obj)).rejects.toBe(error);
    expect(shown()).toEqual([true, true, true]);
  });

  it('only logs a failed read', async () => {
    await expect(database.fetchAll('ns')).rejects.toBe(error);
    await expect(database.fetchById('ns', 'w')).rejects.toBe(error);
    expect(shown()).toEqual([false, false]);
  });
});

describe('datastore changes missed while the eventbus was not connected', () => {
  const obj = (id: string, value: number): StoreObject =>
    ({ id, namespace: 'ns', value }) as StoreObject;

  const mockValues = (values: StoreObject[]): void => {
    vi.mocked(http.post).mockResolvedValue({ data: { values } });
  };

  function deferValues(): (values: StoreObject[]) => void {
    let respond!: (resp: unknown) => void;
    vi.mocked(http.post).mockReturnValueOnce(new Promise((r) => (respond = r)));
    return (values) => respond({ data: { values } });
  }

  const flush = (): Promise<void> => new Promise((r) => setTimeout(r));

  let onConnect: () => Promise<void>;
  let storeEvent: EventCallback;
  let onChanged: Mock;
  let onDeleted: Mock;

  beforeEach(async () => {
    vi.spyOn(http, 'get').mockResolvedValue({});
    vi.spyOn(http, 'post');
    vi.spyOn(notify, 'error').mockImplementation(() => {});
    vi.spyOn(eventbus, 'subscribe').mockImplementation(() => {});
    vi.spyOn(eventbus, 'addListener').mockImplementation((_, cb) => {
      storeEvent = cb;
      return 'listener';
    });
    vi.spyOn(eventbus, 'onConnect').mockImplementation((cb) => {
      onConnect = cb as () => Promise<void>;
    });
    const db = new BrewbloxRedisDatabase();
    await db.connect();
    onChanged = vi.fn();
    onDeleted = vi.fn();
    db.subscribe({ namespace: 'ns', onChanged, onDeleted });
    mockValues([obj('a', 1), obj('b', 1)]);
    await db.fetchAll('ns');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('are fetched when the eventbus connects', async () => {
    mockValues([obj('a', 2), obj('c', 1)]);
    await onConnect();

    expect(onChanged.mock.calls).toEqual([[obj('a', 2)], [obj('c', 1)]]);
    expect(onDeleted.mock.calls).toEqual([['b']]);
  });

  it('pass on only the objects that changed', async () => {
    mockValues([obj('a', 1), obj('b', 2)]);
    await onConnect();

    expect(onChanged.mock.calls).toEqual([[obj('b', 2)]]);
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('include deletions of objects that arrived as change events', async () => {
    storeEvent('brewcast/datastore/ns', { changed: [obj('d', 1)] });
    storeEvent('brewcast/datastore/ns', { deleted: ['ns:a'] });
    onChanged.mockClear();
    onDeleted.mockClear();

    mockValues([obj('b', 1)]);
    await onConnect();

    expect(onChanged).not.toHaveBeenCalled();
    expect(onDeleted.mock.calls).toEqual([['d']]);
  });

  it('delete everything when the datastore answers with nothing', async () => {
    mockValues([]);
    await onConnect();

    expect(onDeleted.mock.calls).toEqual([['a'], ['b']]);
  });

  it('prefer change events that arrive during the fetch', async () => {
    const respond = deferValues();
    const catchingUp = onConnect();
    await flush();
    storeEvent('brewcast/datastore/ns', {
      changed: [obj('a', 3), obj('e', 1)],
    });
    storeEvent('brewcast/datastore/ns', { deleted: ['ns:b'] });
    onChanged.mockClear();
    onDeleted.mockClear();

    // Read by the datastore before the events
    respond([obj('a', 1), obj('b', 1)]);
    await catchingUp;
    expect(onChanged).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();

    mockValues([obj('a', 3), obj('e', 1)]);
    await onConnect();
    expect(onChanged).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('drop a fetch that a later connect replaced', async () => {
    const respondFirst = deferValues();
    const first = onConnect();
    await flush();
    mockValues([obj('a', 3), obj('b', 1)]);
    await onConnect();
    expect(onChanged.mock.calls).toEqual([[obj('a', 3)]]);

    respondFirst([obj('a', 2), obj('b', 1)]);
    await first;
    expect(onChanged.mock.calls).toEqual([[obj('a', 3)]]);
  });

  it('drop a fetch that a later connect replaced while it was pending', async () => {
    const respondFirst = deferValues();
    const first = onConnect();
    await flush();
    const respondSecond = deferValues();
    const second = onConnect();
    await flush();

    respondFirst([obj('a', 1), obj('b', 1)]);
    await first;
    storeEvent('brewcast/datastore/ns', { changed: [obj('a', 3)] });
    onChanged.mockClear();

    respondSecond([obj('a', 2), obj('b', 1)]);
    await second;
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('drop a connect that a later one replaced while it waited for the datastore', async () => {
    let answerPing!: (v: unknown) => void;
    vi.mocked(http.get).mockReturnValueOnce(
      new Promise((r) => (answerPing = r)),
    );
    const first = onConnect();
    const respondSecond = deferValues();
    const second = onConnect();
    await flush();

    answerPing({});
    await first;
    storeEvent('brewcast/datastore/ns', { changed: [obj('a', 3)] });
    onChanged.mockClear();

    respondSecond([obj('a', 2), obj('b', 1)]);
    await second;
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('pass on an object again when its handler failed', async () => {
    onChanged.mockImplementationOnce(() => {
      throw new Error('handler error');
    });
    mockValues([obj('a', 2), obj('b', 1)]);
    await onConnect();
    expect(notify.error).toHaveBeenCalled();

    await onConnect();
    expect(onChanged.mock.calls).toEqual([[obj('a', 2)], [obj('a', 2)]]);
  });

  it('keep the stores as they are when the fetch fails', async () => {
    vi.mocked(http.post).mockRejectedValue(new AxiosError('Network Error'));
    await onConnect();

    expect(onChanged).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
