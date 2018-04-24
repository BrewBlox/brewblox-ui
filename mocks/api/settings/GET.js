const { merge } = require('lodash');

const base = require('./GET.json');
const { getData } = require('./storage');

module.exports = (request, response) => {
  response.send(JSON.stringify(
    merge(
      {},
      base,
      getData(),
    ),
  ));
};
