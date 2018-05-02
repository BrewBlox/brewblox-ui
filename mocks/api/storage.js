const _ = require('lodash');

const base = require('./base.json');

const storage = {};

function get(path) {
  const baseObject = _.get(base, path);
  const storageObject = _.get(storage, path);

  console.log(baseObject, storageObject);

  if (!storageObject) {
    return baseObject;
  }

  if (typeof storageObject !== 'object') {
    return storageObject;
  }

  return _.merge(baseObject, storageObject);
}

function update(path, data) {
  _.update(storage, path, () => data);

  return get(path);
}

function updateById(path, id, data) {
  const objects = get(path);

  // not found? return with new item
  if (!objects.id) {
    return update(path, [...objects, { id, ...data }]);
  }

  // update the item in the array
  update(path, objects.map((obj) => {
    if (obj.id === id) {
      return _.merge({}, obj, data);
    }

    return obj;
  }));

  return get(path);
}

module.exports = {
  get,
  update,
  updateById,
};
