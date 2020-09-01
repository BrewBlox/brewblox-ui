import { Notify } from 'quasar';

import { HOST } from '@/helpers/const';
import http from '@/helpers/http';
import notify from '@/helpers/notify';

import { BrewbloxDatabase, EventHandler, StoreObject } from './types';


const cleanId = (moduleId: string, fullId: string): string =>
  fullId.replace(/^(.+)__/, '');

const fullId = (moduleId: string, id: string): string =>
  `${moduleId}__${id}`;

const strippedId = (fullId: string): string =>
  fullId.match(/^(.+)__/)?.[1] ?? '';

const stripObjId = <T extends StoreObject>(moduleId: string, obj: T): T => {
  return { ...obj, id: cleanId(moduleId, obj.id) };
};

const catObjId = <T extends StoreObject>(moduleId: string, obj: T): T => {
  return { ...obj, id: fullId(moduleId, obj.id) };
};

const intercept = (message: string, moduleId: string): (e: Error) => never =>
  (e: Error) => {
    notify.error(`DB error in ${message}(${moduleId}): ${e.message}`, { shown: false });
    throw e;
  };

const retryDatastore = async (): Promise<void> => {
  while (true) {
    // Try to fetch the datastore
    // If it responds, it is available, and we can reload the page to use it
    // If it doesn't respond, show a notification with a progress bar
    // The notification resolves the awaited promise after `timeout` ms
    await new Promise(resolve =>
      http.get('/history/datastore/ping', { timeout: 2000 })
        .then(() => location.reload()) // reload page will abort the JS runtime
        .catch(() => Notify.create({
          timeout: 2000,
          icon: 'mdi-wifi-off',
          color: 'info',
          message: 'Waiting for datastore...',
          progress: true,
          onDismiss: () => resolve(), // continue
        })));
  }
};

export const checkDatastore = (): void => {
  http.get('/history/datastore/ping', { timeout: 2000 })
    .catch(err => {
      notify.error(`Datastore error: ${err}`, { shown: false });
      retryDatastore();
    });
};

export class BrewbloxRedisImpl implements BrewbloxDatabase {
  private readonly namespace = 'brewblox-ui-store';
  private handlers: Mapped<EventHandler> = {}

  public constructor() {
  }

  public subscribe(handler: EventHandler): void {
    if (!handler.id) {
      throw new Error('Database handler id not set');
    }
    if (this.handlers[handler.id] !== undefined) {
      throw new Error(`Database handler '${module.id}' is already registered`);
    }
    this.handlers[handler.id] = Object.freeze(handler);
  }

  public async fetchAll<T extends StoreObject>(moduleId: string): Promise<T[]> {
    return http
      .post<T[]>('/history/datastore/mget', {
        namespace: this.namespace,
        filter: `${moduleId}__*`,
      })
      .then(resp => resp.data.map(obj => stripObjId(moduleId, obj)))
      .catch(intercept('Fetch all objects', moduleId));
  }

  public async fetchById<T extends StoreObject>(moduleId: string, objId: string): Promise<T> {
    return http
      .post<T>('/history/datastore/get', {
        namespace: this.namespace,
        key: fullId(moduleId, objId),
      })
      .then(resp => stripObjId(moduleId, resp.data))
      .catch(intercept(`Fetch '${objId}'`, moduleId));
  }

  public async persist<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
    return http
      .post<T>('/history/datastore/set', {
        namespace: this.namespace,
        value: catObjId(moduleId, obj),
      })
      .then(resp => stripObjId(moduleId, resp.data))
      .catch(intercept(`Persist '${obj.id}'`, moduleId));
  }

  public create = this.persist;

  public async remove<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
    await http
      .post('/history/datastore/delete', {
        namespace: this.namespace,
        key: fullId(moduleId, obj.id),
      })
      .catch(intercept(`Remove '${obj.id}'`, moduleId));
    return obj;
  }
}
