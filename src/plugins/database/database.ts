import { AxiosError } from 'axios';
import isObjectLike from 'lodash/isObjectLike';
import { Notify } from 'quasar';
import Vue from 'vue';

import { STORE_TOPIC } from '@/helpers/const';
import http, { parseHttpError } from '@/helpers/http';
import notify from '@/helpers/notify';
import { DatastoreEvent, StoreObject } from '@/shared-types';

import { BrewbloxDatabase, EventHandler } from './types';

const isStoreEvent = (data: unknown): data is DatastoreEvent =>
  isObjectLike(data)
  && ('changed' in (data as any) || 'deleted' in (data as any));

const moduleNamespace = (moduleId: string): string =>
  `brewblox-ui-store:${moduleId}`;

function intercept(message: string, moduleId: string): ((e: AxiosError) => never) {
  return (e: AxiosError) => {
    notify.error(`DB error in ${message}(${moduleId}): ${parseHttpError(e)}`, { shown: false });
    throw e;
  };
}

async function retryDatastore(): Promise<void> {
  while (true) {
    try {
      await http.get('/history/datastore/ping', { timeout: 2000 });
      notify.done('Datastore connected');
      break;
    }
    catch (e) {
      // show a notification with a progress bar
      // The notification resolves the promise after `timeout` ms
      await new Promise<void>((resolve) =>
        Notify.create({
          timeout: 2000,
          icon: 'mdi-wifi-off',
          color: 'info',
          message: 'Waiting for datastore...',
          progress: true,
          onDismiss: () => resolve(),
        }));
    }
  }
}

async function checkDatastore(): Promise<void> {
  try {
    await http.get('/history/datastore/ping', { timeout: 2000 });
  }
  catch (e) {
    notify.error(`Datastore error: ${e}`, { shown: false });
    await retryDatastore();
  }
}

export class BrewbloxRedisDatabase implements BrewbloxDatabase {
  // handlers are indexed on fully qualified namespace
  private handlers: Mapped<EventHandler> = {}

  public async connect(): Promise<void> {
    Vue.$eventbus.subscribe(STORE_TOPIC);
    Vue.$eventbus.addListener(STORE_TOPIC, (_, data) => {
      if (isStoreEvent(data)) {
        data.changed && this.onChanged(data.changed);
        data.deleted && this.onDeleted(data.deleted);
      }
    });
    await checkDatastore();
  }

  private onChanged(changed: StoreObject[]): void {
    changed.forEach(obj =>
      this.handlers[obj.namespace!]?.onChanged(obj));
  }

  private onDeleted(deleted: string[]): void {
    deleted.forEach(key => {
      // The event uses the fully qualified ID
      // Separate the namespace from the ID here
      const idx = key.lastIndexOf(':');
      const namespace = key.substring(0, idx);
      const id = key.substring(idx + 1);
      this.handlers[namespace]?.onDeleted(id);
    });
  }

  public subscribe(handler: EventHandler): void {
    if (!handler.id) {
      throw new Error('Database handler id not set');
    }
    const namespace = moduleNamespace(handler.id);
    if (this.handlers[namespace] !== undefined) {
      throw new Error(`Database handler '${module.id}' is already registered`);
    }
    this.handlers[namespace] = Object.freeze(handler);
  }

  public async fetchAll<T extends StoreObject>(moduleId: string): Promise<T[]> {
    return http
      .post<{ values: T[] }>('/history/datastore/mget', {
        namespace: moduleNamespace(moduleId),
        filter: '*',
      })
      .then(resp => resp.data.values)
      .catch(intercept('Fetch all objects', moduleId));
  }

  public async fetchById<T extends StoreObject>(moduleId: string, objId: string): Promise<T> {
    return http
      .post<{ value: T }>('/history/datastore/get', {
        namespace: moduleNamespace(moduleId),
        id: objId,
      })
      .then(resp => resp.data.value)
      .catch(intercept(`Fetch '${objId}'`, moduleId));
  }

  public async persist<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
    return http
      .post<{ value: T }>('/history/datastore/set', {
        value: {
          ...obj,
          namespace: moduleNamespace(moduleId),
        },
      })
      .then(resp => resp.data.value)
      .catch(intercept(`Persist '${obj.id}'`, moduleId));
  }

  public create = this.persist;

  public async remove<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
    await http
      .post('/history/datastore/delete', {
        namespace: moduleNamespace(moduleId),
        id: obj.id,
      })
      .catch(intercept(`Remove '${obj.id}'`, moduleId));
    return obj;
  }
}
