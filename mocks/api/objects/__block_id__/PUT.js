const { merge } = require('lodash');

const { getBlock } = require('./helpers');

module.exports = (request, response) => {
  const id = decodeURIComponent(request.params.block_id);
  const base = getBlock(id);

  setTimeout(() => {
    response.send(JSON.stringify(merge(base, request.body)));
  }, 1000);
};
