const { get } = require('../../../storage');

module.exports = (request, response) => {
  const controllerId = decodeURIComponent(request.params.controller_id);
  const blockId = decodeURIComponent(request.params.block_id);
  const objects = get(`objects.${controllerId}`);
  response.send(JSON.stringify(objects.find(obj => obj.id === blockId)));
};
