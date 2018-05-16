const { getBlock } = require('./helpers');

module.exports = (request, response) => {
  const id = decodeURIComponent(request.params.block_id);
  const controllerId = decodeURIComponent(request.params.controller_id);

  response.send(JSON.stringify(getBlock(id, controllerId)));
};
