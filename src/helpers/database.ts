import PouchDB from 'pouchdb';

type ChangeEvent = PouchDB.Core.ChangesResponseChange<{}>;

const host = process.env.VUE_APP_API_URI || window.location.origin;

export const createDatabase = (name: string): PouchDB.Database => new PouchDB(name);

export const addSync = (db: PouchDB.Database, onChange: (evt: ChangeEvent) => void) => {
  db
    .changes({ live: true, include_docs: true, since: 'now' })
    .on('change', onChange);
};

export const addReplicate = (db: PouchDB.Database) =>
  db.sync(`${host}/datastore/${db.name}`, { live: true, retry: true });


export const toDocument = (doc) => {
  const { id, ...obj } = doc;
  return { ...obj, _id: id };
};

export const toNewDocument = (doc) => {
  const { _rev, ...obj } = doc;
  return toDocument(obj);
};

export const fromDocument = (doc) => {
  const { _id, ...obj } = doc;
  return { ...obj, id: _id };
};

export interface NewStoreObject {
  id: string;
}

export interface StoreObject extends NewStoreObject {
  _rev: string;
}

export interface ChangeHandler {
  onDeleted: (id: string) => void;
  onChanged: (obj: any) => void;
}

interface Module extends ChangeHandler {
  id: string;
}

const MODULES: Module[] = [];
const DB: PouchDB.Database = new PouchDB('brewblox-ui-store');

const cleanId = (module: string, fullId: string) =>
  fullId.substring(`${module}__`.length);

const prefixId = (module: string, id: string) =>
  `${module}__${id}`;

const asStoreObject = (module: string, doc: any) => {
  const { _id, ...obj } = doc;
  return { ...obj, id: cleanId(module, _id) };
};

const asDocument = (module: string, obj: any) => {
  const { id, ...doc } = obj;
  return { ...doc, _id: prefixId(module, id) };
};

const asNewDocument = (module: string, obj: any) => {
  const { _rev, ...cleanObj } = obj;
  return asDocument(module, cleanObj);
};

DB
  .changes({ live: true, include_docs: true, since: 'now' })
  .on('change', (evt: ChangeEvent) => {
    const handler = MODULES.find(m => m.id.startsWith(`${evt.id}__`));
    if (!handler) {
      return;
    }
    if (evt.deleted) {
      handler.onDeleted(cleanId(handler.id, evt.id));
    } else {
      handler.onChanged(asStoreObject(handler.id, evt.doc));
    }
  });

const assertModule = (module: string) => {
  if (!MODULES[module]) {
    throw new Error(`Database module "${module}" was not registered before use`);
  }
};

export function registerModule(module: string, handler: ChangeHandler) {
  if (MODULES.find(m => m.id === module)) {
    throw new Error(`Database module "${module}" is already registered`);
  }
  MODULES.push({ id: module, ...handler });
}

export async function fetchAll(module: string) {
  const prefix = `${module}__`;
  const resp = await DB.allDocs({ include_docs: true });
  return resp.rows
    .filter(row => row.id.startsWith(prefix))
    .map(row => asStoreObject(row.id.substring(prefix.length), row.doc));
}

export function create<T extends NewStoreObject>(module: string, obj: T) {

}

export function persist<T extends StoreObject>(module: string, obj: T) {

}

export function remove<T extends StoreObject>(module: string, obj: T) {

}
