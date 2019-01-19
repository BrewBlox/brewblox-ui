import PouchDB from 'pouchdb';

type ChangeEvent = PouchDB.Core.ChangesResponseChange<{}>;

export interface StoreObject {
  id: string;
  _rev?: string;
}

export interface Module {
  onDeleted: (id: string) => void;
  onChanged: (obj: any) => void;
  id: string;
}

const HOST = process.env.VUE_APP_API_URI || window.location.origin;
const MODULES: Module[] = [];
const DB_NAME = 'brewblox-ui-store';
const DB: PouchDB.Database = new PouchDB(DB_NAME);

DB
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

DB
  .sync(`${HOST}/datastore/${DB_NAME}`, { live: true, retry: true });

const cleanId = (moduleId: string, fullId: string) =>
  fullId.substring(`${moduleId}__`.length);

const fullId = (moduleId: string, id: string) =>
  `${moduleId}__${id}`;

const checkInModule = (moduleId: string, fullId: string) =>
  fullId.startsWith(`${moduleId}__`);

const asStoreObject = (moduleId: string, doc: any) => {
  const { _id, ...obj } = doc;
  return { ...obj, id: cleanId(moduleId, _id) };
};

const asDocument = (moduleId: string, obj: any) => {
  const { id, ...doc } = obj;
  return { ...doc, _id: fullId(moduleId, id) };
};

const asNewDocument = (moduleId: string, obj: any) => {
  const { _rev, ...cleanObj } = obj;
  return asDocument(moduleId, cleanObj);
};

export function registerModule(module: Module) {
  if (MODULES.find(m => m.id === module.id)) {
    throw new Error(`Database module "${module.id}" is already registered`);
  }
  MODULES.push({ ...module });
}

export async function fetchAll(moduleId: string) {
  const resp = await DB.allDocs({ include_docs: true });
  return resp.rows
    .filter(row => checkInModule(moduleId, row.id))
    .map(row => asStoreObject(moduleId, row.doc));
}

export async function fetchById(moduleId: string, objId: string) {
  return asStoreObject(moduleId, await DB.get(fullId(moduleId, objId)));
}

export async function create<T extends StoreObject>(moduleId: string, obj: T) {
  const resp = await DB.put(asNewDocument(moduleId, obj));
  return { ...obj, _rev: resp.rev };
}

export async function persist<T extends StoreObject>(moduleId: string, obj: T) {
  const resp = await DB.put(asDocument(moduleId, obj));
  return { ...obj, _rev: resp.rev };
}

export async function remove<T extends StoreObject>(moduleId: string, obj: T) {
  await DB.remove(asDocument(moduleId, obj));
  const { _rev, ...cleanObj } = obj;
  return cleanObj;
}
