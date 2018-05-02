const _ = require('lodash');
const base = require('./storage.json');

const storage = {};

function get(path) {
  const baseObject = _.get(base, path);
  const storageObject = _.get(storage, path);

  if (typeof storageObject !== 'object') {
    return storageObject;
  }

  return _.merge(baseObject, storageObject);
}

function update(path, data) {
  _.update(storage, path, () => data);

  return get(path);
}

module.exports = {
  get,
  update,
};
