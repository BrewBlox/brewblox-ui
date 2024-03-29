import { AxiosError, AxiosResponse } from 'axios';
import { DatastoreEvent, StoreObject } from 'brewblox-proto/ts';
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

function intercept(message: string, namespace: string): (e: unknown) => never {
  return (e: unknown) => {
    notify.error(`DB error in ${message}(${namespace}): ${parseHttpError(e)}`, {
      shown: false,
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

export class BrewbloxRedisDatabase implements BrewbloxDatabase {
  // handlers are indexed on namespace
  private handlers: Mapped<EventHandler> = {};
  private rootNamespaces: string[] = [];

  public async connect(): Promise<void> {
    await checkDatastore();
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
    changed.forEach((obj) => this.handlers[obj.namespace!]?.onChanged(obj));
  }

  private onDeleted(deleted: string[]): void {
    deleted.forEach((key) => {
      // The event uses the fully qualified ID
      // Separate the namespace from the ID here
      const idx = key.lastIndexOf(':');
      const namespace = key.substring(0, idx);
      const id = key.substring(idx + 1);
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

  public async fetchAll<T extends StoreObject>(
    namespace: string,
  ): Promise<T[]> {
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
      .catch(intercept(`Persist '${obj.id}'`, namespace));
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
      .catch(intercept(`PersistMult '${objs.map((v) => v.id)}'`, namespace));
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
      .catch(intercept(`Remove '${obj.id}'`, namespace));
    return obj;
  }
}
