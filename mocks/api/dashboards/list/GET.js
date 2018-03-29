const { merge } = require('lodash');

const base = require('./GET.json');
const { storage } = require('../items/storage');

module.exports = (request, response) => {
  response.send(JSON.stringify(
    merge(
      {},
      base,
      {
        items: base.items.map(item => merge({}, item, storage[item.id])),
      },
    ),
  ));
};
