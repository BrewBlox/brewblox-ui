const { updateById } = require('../../../storage');

module.exports = (request, response) => {
  const controllerId = decodeURIComponent(request.params.controller_id);
  const blockId = decodeURIComponent(request.params.block_id);

  response.send(JSON.stringify(updateById(`objects.${controllerId}`, blockId, request.body)));
};

