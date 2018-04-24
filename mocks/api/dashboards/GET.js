const { merge } = require('lodash');

const base = require('./GET.json');
const { storage } = require('./storage');

module.exports = (request, response) => {
  response.send(JSON.stringify(
    [
      ...Object.keys(storage).filter(key => !!storage[key].id).map(key => storage[key]),
      ...base.map(item => merge({}, item, storage[item.id])),
    ],
  ));
};
