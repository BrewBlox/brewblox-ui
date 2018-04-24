const { merge } = require('lodash');

const storage = {};

module.exports = {
  storage,
  updateData(id, data) {
    storage[id] = merge({}, storage[id], data);
  },
};
