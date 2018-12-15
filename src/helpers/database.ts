import PouchDB from 'pouchdb';

type ChangeEvent = PouchDB.Core.ChangesResponseChange<{}>;

const host = process.env.VUE_APP_API_URI || window.location.origin;

export const createDatabase = (name: string): PouchDB.Database => new PouchDB(name);

export const addSync = (db: PouchDB.Database, onChange: (evt: ChangeEvent) => void) => {
  db.changes({ live: true, include_docs: true, since: 'now' })
    .on('change', onChange);
};

export const addReplicate = (db: PouchDB.Database, onError: (err: PouchDB.Core.Error | null) => void) => {
  db.sync(`${host}/datastore/${db.name}`, { live: true, retry: true }, onError);
};

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
