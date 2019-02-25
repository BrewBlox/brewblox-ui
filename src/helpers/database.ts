import PouchDB from 'pouchdb';

type ChangeEvent = PouchDB.Core.ChangesResponseChange<{}>;

export interface StoreObject {
  id: string;
  _rev?: string;
  [key: string]: any;
}

export interface Module {
  onDeleted: (id: string) => void;
  onChanged: (obj: any) => void;
  id: string;
}

const HOST = process.env.VUE_APP_API_URI || window.location.origin;
const MODULES: Module[] = [];
const DB_NAME = 'brewblox-ui-store';

const cleanId = (moduleId: string, fullId: string): string =>
  fullId.substring(`${moduleId}__`.length);

const fullId = (moduleId: string, id: string): string =>
  `${moduleId}__${id}`;

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

const databaseInfo =
  async (db: PouchDB.Database): Promise<PouchDB.Core.DatabaseInfo | null> => {
    try {
      return await db.info();
    } catch (e) {
      return null;
    }
  };

/*
  We want to synchronize between a client-side local database, and the remote datastore,
  but avoid contaminating the remote store if it is changed externally.

  On startup, we try to connect to the remote datastore.
  If it is reachable, we destroy the local store, and enable synchronization between local and remote.

  If the remote datastore is unreachable, we keep the local state, and do not enable synchronization.
  This scenario is only intended as a fallback: it allows users limited functionality if the datastore service is dead.
*/
const promisedDB: Promise<PouchDB.Database> = new Promise((resolve) => {
  const remoteAddress = `${HOST}/datastore/${DB_NAME}`;
  const localDb: PouchDB.Database = new PouchDB(DB_NAME);
  const remoteDb: PouchDB.Database = new PouchDB(remoteAddress);

  databaseInfo(remoteDb)
    .then(async (remoteInfo) => {
      if (remoteInfo) {
        await localDb.destroy();
      }

      const actualDb = new PouchDB(DB_NAME);

      actualDb
        /* eslint-disable-next-line @typescript-eslint/camelcase */
        .changes({ live: true, include_docs: true, since: 'now' })
        .on('change', (evt: ChangeEvent) => {
          const handler = MODULES.find(m => checkInModule(m.id, evt.id));
          if (!handler) {
            return;
          }
          if (evt.deleted) {
            handler.onDeleted(cleanId(handler.id, evt.id));
          } else {
            handler.onChanged(asStoreObject(handler.id, evt.doc));
          }
        });

      if (remoteInfo) {
        actualDb.sync(remoteAddress, { live: true, retry: true });
      }

      resolve(actualDb);
    });
});


export function registerModule(module: Module): void {
  if (MODULES.find(m => m.id === module.id)) {
    throw new Error(`Database module "${module.id}" is already registered`);
  }
  MODULES.push({ ...module });
}

export async function fetchAll(moduleId: string): Promise<any[]> {
  const db = await promisedDB;
  /* eslint-disable-next-line @typescript-eslint/camelcase */
  const resp = await db.allDocs({ include_docs: true });
  return resp.rows
    .filter(row => checkInModule(moduleId, row.id))
    .map(row => asStoreObject(moduleId, row.doc));
}

export async function fetchById<T extends StoreObject>(
  moduleId: string, objId: string
): Promise<T> {
  const db = await promisedDB;
  return asStoreObject(moduleId, await db.get(fullId(moduleId, objId)));
}

export async function create<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
  const db = await promisedDB;
  const resp = await db.put(asNewDocument(moduleId, obj));
  return { ...obj, _rev: resp.rev };
}

export async function persist<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
  const db = await promisedDB;
  const resp = await db.put(asDocument(moduleId, obj));
  return { ...obj, _rev: resp.rev };
}

export async function remove<T extends StoreObject>(moduleId: string, obj: T): Promise<T> {
  const db = await promisedDB;
  await db.remove(asDocument(moduleId, obj));
  delete obj._rev;
  return obj;
}
