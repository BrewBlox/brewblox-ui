const { updateById } = require('../../storage');

module.exports = (request, response) => {
  const controllerId = decodeURIComponent(request.params.controller_id);

  response.send(JSON.stringify(updateById(`objects.${controllerId}`, request.body.id, request.body)));
};

