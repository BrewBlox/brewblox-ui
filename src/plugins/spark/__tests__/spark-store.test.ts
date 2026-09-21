import { Block, BlockType } from 'brewblox-proto/ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSparkStore } from '@/plugins/spark/store';

// Capture the eventbus listeners the store registers, so that
// state and patch events can be delivered directly.
const mocks = vi.hoisted(() => ({
  listeners: {} as Record<string, (topic: string, evt: unknown) => void>,
}));

vi.mock('@/eventbus', () => ({
  eventbus: {
    subscribe: () => {},
    unsubscribe: () => {},
    addListener: (topic: string, cb: (topic: string, evt: unknown) => void) => {
      mocks.listeners[topic] = cb;
      return topic;
    },
    removeListener: (id: string) => {
      delete mocks.listeners[id];
    },
  },
}));

const serviceId = 'sparkey';

const block = (id: string, value: number): Block =>
  ({
    id,
    serviceId,
    type: BlockType.TempSensorMock,
    data: { value },
  }) as unknown as Block;

const stateEvent = (blocks: Block[] | null): unknown => ({
  key: serviceId,
  type: 'Spark.state',
  data: blocks ? { blocks, status: null, relations: [], claims: [] } : null,
});

const patchEvent = (changed: Block[], deleted: string[] = []): unknown => ({
  key: serviceId,
  type: 'Spark.patch',
  data: { changed, deleted },
});

const send = (suffix: string, evt: unknown): void =>
  mocks.listeners[`brewcast/state/${serviceId}${suffix}`]('', evt);

const ids = (store: ReturnType<typeof useSparkStore>): string[] =>
  store.blocks[serviceId].map((v) => v.id);

describe('Spark store block events', () => {
  let store: ReturnType<typeof useSparkStore>;

  beforeEach(async () => {
    store = useSparkStore();
    if (!store.has(serviceId)) {
      await store.addService(serviceId);
    }
    send('', stateEvent([block('Pid-1', 1), block('Setpoint-1', 2)]));
  });

  it('applies a patch to the full block list', () => {
    send('/patch', patchEvent([block('Setpoint-1', 3)], ['Pid-1']));
    expect(ids(store)).toEqual(['Setpoint-1']);
    expect(store.blockById(serviceId, 'Setpoint-1')?.data.value).toBe(3);
  });

  it('ignores a patch while the block list is empty', () => {
    // The service broadcasts an empty list while it is not synchronized
    send('', stateEvent([]));
    send('/patch', patchEvent([block('Setpoint-1', 3)]));
    expect(ids(store)).toEqual([]);

    // The service sends no data at all while disconnected
    send('', stateEvent([block('Pid-1', 1)]));
    send('', stateEvent(null));
    send('/patch', patchEvent([block('Setpoint-1', 3)]));
    expect(ids(store)).toEqual([]);

    // The watcher invalidates the list when the service goes stale
    send('', stateEvent([block('Pid-1', 1)]));
    store.invalidateBlocks(serviceId);
    send('/patch', patchEvent([block('Setpoint-1', 3)]));
    expect(ids(store)).toEqual([]);

    // The next full state event restores everything
    send('', stateEvent([block('Pid-1', 1), block('Setpoint-1', 3)]));
    expect(ids(store)).toEqual(['Pid-1', 'Setpoint-1']);
  });
});
