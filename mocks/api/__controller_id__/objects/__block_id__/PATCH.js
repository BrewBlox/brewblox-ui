const { merge } = require('lodash');

const { getBlock } = require('./helpers');

module.exports = (request, response) => {
  const id = decodeURIComponent(request.params.block_id);
  const controllerId = decodeURIComponent(request.params.controller_id);
  const base = getBlock(id, controllerId);

  setTimeout(() => {
    response.send(JSON.stringify(merge(base, request.body)));
  }, 1000);
};
