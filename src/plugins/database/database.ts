/* eslint-disable @typescript-eslint/camelcase */
import PouchDB from 'pouchdb';

import { HOST } from '@/helpers/const';
import fetch from '@/helpers/fetch';
import notify from '@/helpers/notify';

import { BrewbloxDatabase, EventHandler, StoreObject } from './types';

const cleanId = (moduleId: string, fullId: string): string =>
  fullId.substring(`${moduleId}__`.length);

const fullId = (moduleId: string, id: string): string =>
  `${moduleId}__${id}`;

const strippedId = (fullId: string): string =>
  fullId.match(/^(.+)__/)?.[1] ?? '';

const checkInModule = (moduleId: string, fullId: string): boolean =>
  fullId.startsWith(`${moduleId}__`);

const asStoreObject = (moduleId: string, doc: any): any => {
  const { _id, ...obj } = doc;
  return { ...obj, id: cleanId(moduleId, _id) };
};

const asDocument = (moduleId: string, obj: any): any => {
  const { id, ...doc } = obj;
  return { ...doc, _id: fullId(moduleId, id) };
};

const asNewDocument = (moduleId: string, obj: any): any => {
  delete obj._rev;
  return asDocument(moduleId, obj);
};

const checkRemote = async (db: PouchDB.Database): Promise<void> => {
  await db.info()
    .catch((e) => {
      notify.error(`Remote database unavailable: ${e.message}`, { shown: false });
    });
};

const intercept = (message: string, moduleId: string): (e: Error) => never =>
  (e: Error) => {
    notify.error(`DB error in ${message}(${moduleId}): ${e.message}`, { shown: false });
    throw e;
  };

export const checkDatastore = (): void => {
  fetch('/datastore', { timeout: 2000 })
    .catch(err => {
      notify.error(`Datastore error: ${err}`, { shown: false });
      notify.error({
        timeout: 0,
        icon: 'error',
        message: 'Datastore not (yet) available',
        actions: [
          {
            label: 'Reload page',
            textColor: 'white',
            handler: () => location.reload(),
          },
        ],
      });
    });
};


type ChangeEvent = PouchDB.Core.ChangesResponseChange<{}>;

export class BrewbloxDatabaseImpl implements BrewbloxDatabase {
  private promisedDb: Promise<PouchDB.Database>;
  private handlers: Mapped<EventHandler> = {}

  public constructor() {
    this.promisedDb = new Promise((resolve) => {
      const remoteAddress = `${HOST}/datastore/brewblox-ui-store`;
      const remoteDb: PouchDB.Database = new PouchDB(remoteAddress);

      checkRemote(remoteDb)
        .then(() => {
          remoteDb
            .changes({ live: true, include_docs: true, since: 'now' })
            .on('change', (evt: ChangeEvent) => {
              const moduleId = strippedId(evt.id);
              evt.deleted
                ? this.handlers[moduleId]?.onDeleted(cleanId(moduleId, evt.id))
                : this.handlers[moduleId]?.onChanged(asStoreObject(moduleId, evt.doc));
            });

          resolve(remoteDb);
        });
    });
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
    const db = await this.promisedDb;
    const resp = await db.allDocs({ include_docs: true })
      .catch(intercept('Fetch all objects', moduleId));
    return resp.rows
      .filter(row => checkInModule(moduleId, row.id))
      .map(row => asStoreObject(moduleId, row.doc));
  }

  public async fetchById<T extends StoreObject>(
    moduleId: string, objId: string
  ): Promise<T> {
    const db = await this.promisedDb;
    const obj = await db.get(fullId(moduleId, objId))
      .catch(intercept(`Fetch '${objId}'`, moduleId));
    return asStoreObject(moduleId, obj);
  }

  public async create<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
    const db = await this.promisedDb;
    const resp = await db.put(asNewDocument(moduleId, obj))
      .catch(intercept('Create object', moduleId));
    return { ...obj, _rev: resp.rev };
  }

  public async persist<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
    const db = await this.promisedDb;
    const resp = await db.put(asDocument(moduleId, obj))
      .catch(intercept('Persist object', moduleId));
    return { ...obj, _rev: resp.rev };
  }

  public async remove<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
    const db = await this.promisedDb;
    await db.remove(asDocument(moduleId, obj))
      .catch(intercept('Remove object', moduleId));
    delete obj._rev;
    return obj;
  }
}
