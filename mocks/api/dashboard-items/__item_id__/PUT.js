const { updateById } = require('../../storage');

module.exports = (request, response) => {
  const id = decodeURIComponent(request.params.item_id);

  response.send(JSON.stringify(updateById('dashboard-items', id, request.body)));
};
