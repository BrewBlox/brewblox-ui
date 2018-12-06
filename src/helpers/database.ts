import PouchDB from 'pouchdb';

const host = process.env.VUE_APP_API_URI;

export const createDatabase = (name: string) =>
  new PouchDB(`${host}/datastore/${name}`);

export const toDocument = (doc) => {
  const { id, ...obj } = doc;
  return { ...obj, _id: id };
};

export const fromDocument = (doc) => {
  const { _id, ...obj } = doc;
  return { ...obj, id: _id };
};
