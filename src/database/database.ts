import { AxiosError, AxiosResponse } from 'axios';
import { DatastoreEvent, StoreObject } from 'brewblox-proto/ts';
import isEqual from 'lodash/isEqual';
import isObjectLike from 'lodash/isObjectLike';
import { STORE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import { http, parseHttpError } from '@/utils/http';
import { notify } from '@/utils/notify';
import { BrewbloxDatabase, EventHandler } from './types';

interface SingleQueryArgs {
  namespace: string;
  id: string;
}

interface MultiQueryArgs {
  namespace: string;
  ids?: string;
  filter?: string;
}

interface SingleValue<T extends StoreObject | null> {
  value: T;
}

interface MultiValue<T extends StoreObject> {
  values: T[];
}

const isStoreEvent = (data: unknown): data is DatastoreEvent =>
  isObjectLike(data) &&
  ('changed' in (data as any) || 'deleted' in (data as any));

/**
 * Logs a failed request, and throws on.
 * A failed write is also shown: its change is lost,
 * and the UI shows only what the datastore has.
 */
function intercept(
  message: string,
  namespace: string,
  shown = false,
): (e: unknown) => never {
  return (e: unknown) => {
    notify.error(`DB error in ${message}(${namespace}): ${parseHttpError(e)}`, {
      shown,
    });
    throw e;
  };
}

async function retryDatastore(): Promise<void> {
  while (true) {
    try {
      await http.get('/history/datastore/ping', { timeout: 2000 });
      notify.done('Datastore connected');
      break;
    } catch (e) {
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
    }
  }
}

async function checkDatastore(): Promise<void> {
  try {
    await http.get('/history/datastore/ping', { timeout: 2000 });
  } catch (e) {
    notify.error(`Datastore error: ${parseHttpError(e as AxiosError, true)}`, {
      shown: false,
    });
    await retryDatastore();
  }
}

function reportHandlerError(namespace: string, e: unknown): void {
  notify.error(`DB error in handling a change (${namespace}): ${e}`, {
    shown: false,
  });
}

/**
 * Whether the handler did not throw.
 * An async handler's rejection is reported only.
 */
function handled(namespace: string, handle: () => unknown): boolean {
  try {
    Promise.resolve(handle()).catch((e) => reportHandlerError(namespace, e));
    return true;
  } catch (e) {
    reportHandlerError(namespace, e);
    return false;
  }
}

export class BrewbloxRedisDatabase implements BrewbloxDatabase {
  // handlers are indexed on namespace
  private handlers: Mapped<EventHandler> = {};
  private rootNamespaces: string[] = [];
  // Compared whenever the eventbus connects, to find what changed while it was not
  private lastSeen: Mapped<Map<string, StoreObject>> = {};
  private changedWhileFetching: Mapped<Set<string>> = {};
  private catchUpRun = 0;

  public async connect(): Promise<void> {
    await checkDatastore();
    eventbus.onConnect(() => this.catchUp());
  }

  private async catchUp(): Promise<void> {
    const run = ++this.catchUpRun;
    await checkDatastore();
    // A later connect fetches newer data
    if (run !== this.catchUpRun) {
      return;
    }
    await Promise.all(
      Object.values(this.handlers).map(async (handler) => {
        const { namespace } = handler;
        const changedWhileFetching = new Set<string>();
        this.changedWhileFetching[namespace] = changedWhileFetching;
        const objs = await this.mget(namespace).catch(() => null);
        if (this.changedWhileFetching[namespace] === changedWhileFetching) {
          delete this.changedWhileFetching[namespace];
        }
        if (objs === null || run !== this.catchUpRun) {
          return;
        }

        const seen = this.lastSeen[namespace] ?? new Map<string, StoreObject>();
        this.lastSeen[namespace] = seen;
        // A change event during the fetch may be newer than what the fetch read
        const fetched = new Map(
          objs
            .filter((obj) => !changedWhileFetching.has(obj.id))
            .map((obj) => [obj.id, obj]),
        );
        const deleted = [...seen.keys()].filter(
          (id) => !fetched.has(id) && !changedWhileFetching.has(id),
        );
        const changed = [...fetched.values()].filter(
          (obj) => !isEqual(seen.get(obj.id), obj),
        );

        // A handler that throws gets its object again on the next connect
        deleted
          .filter((id) => handled(namespace, () => handler.onDeleted(id)))
          .forEach((id) => seen.delete(id));
        changed
          .filter((obj) => handled(namespace, () => handler.onChanged(obj)))
          .forEach((obj) => seen.set(obj.id, obj));
      }),
    );
  }

  private subscribeChanged(namespace: string): void {
    const root = namespace.split(':')[0];
    if (this.rootNamespaces.includes(root)) {
      return;
    }
    this.rootNamespaces.push(root);
    eventbus.subscribe(`${STORE_TOPIC}/${root}`);
    eventbus.addListener(`${STORE_TOPIC}/${root}`, (_, data) => {
      if (isStoreEvent(data)) {
        data.changed && this.onChanged(data.changed);
        data.deleted && this.onDeleted(data.deleted);
      }
    });
  }

  private onChanged(changed: StoreObject[]): void {
    changed.forEach((obj) => {
      this.lastSeen[obj.namespace!]?.set(obj.id, obj);
      this.changedWhileFetching[obj.namespace!]?.add(obj.id);
      this.handlers[obj.namespace!]?.onChanged(obj);
    });
  }

  private onDeleted(deleted: string[]): void {
    deleted.forEach((key) => {
      // The event uses the fully qualified ID
      // Separate the namespace from the ID here
      const idx = key.lastIndexOf(':');
      const namespace = key.substring(0, idx);
      const id = key.substring(idx + 1);
      this.lastSeen[namespace]?.delete(id);
      this.changedWhileFetching[namespace]?.add(id);
      this.handlers[namespace]?.onDeleted(id);
    });
  }

  public subscribe(handler: EventHandler): void {
    const { namespace } = handler;
    if (!namespace) {
      throw new Error('Database handler namespace not set');
    }
    if (this.handlers[namespace] !== undefined) {
      throw new Error(`Database handler '${namespace}' is already registered`);
    }
    this.handlers[namespace] = Object.freeze(handler);
    this.subscribeChanged(namespace);
  }

  private async mget<T extends StoreObject>(namespace: string): Promise<T[]> {
    return http
      .post<MultiQueryArgs, AxiosResponse<MultiValue<T>>>(
        '/history/datastore/mget',
        {
          namespace,
          filter: '*',
        },
      )
      .then((resp) => resp.data.values)
      .catch(intercept('Fetch all objects', namespace));
  }

  public async fetchAll<T extends StoreObject>(
    namespace: string,
  ): Promise<T[]> {
    const values = await this.mget<T>(namespace);
    this.lastSeen[namespace] = new Map(values.map((v) => [v.id, v]));
    return values;
  }

  public async fetchById<T extends StoreObject>(
    namespace: string,
    objId: string,
  ): Promise<T | null> {
    return http
      .post<SingleQueryArgs, AxiosResponse<SingleValue<T | null>>>(
        '/history/datastore/get',
        {
          namespace,
          id: objId,
        },
      )
      .then((resp) => resp.data.value)
      .catch(intercept(`Fetch '${objId}'`, namespace));
  }

  public async persist<T extends StoreObject>(
    namespace: string,
    obj: T,
  ): Promise<T> {
    return http
      .post<SingleValue<T>, AxiosResponse<SingleValue<T>>>(
        '/history/datastore/set',
        {
          value: {
            ...obj,
            namespace,
          },
        },
      )
      .then((resp) => resp.data.value)
      .catch(intercept(`Persist '${obj.id}'`, namespace, true));
  }

  public create = this.persist;

  public async persistMult<T extends StoreObject>(
    namespace: string,
    objs: T[],
  ): Promise<T[]> {
    if (objs.length === 0) {
      return [];
    }

    return http
      .post<MultiValue<T>, AxiosResponse<MultiValue<T>>>(
        '/history/datastore/mset',
        {
          values: objs.map((obj) => ({ ...obj, namespace })),
        },
      )
      .then((resp) => resp.data.values)
      .catch(
        intercept(`PersistMult '${objs.map((v) => v.id)}'`, namespace, true),
      );
  }

  public async remove<T extends StoreObject>(
    namespace: string,
    obj: T,
  ): Promise<T> {
    await http
      .post<SingleQueryArgs>('/history/datastore/delete', {
        namespace,
        id: obj.id,
      })
      .catch(intercept(`Remove '${obj.id}'`, namespace, true));
    return obj;
  }
}
