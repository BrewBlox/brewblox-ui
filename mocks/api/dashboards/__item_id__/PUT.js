const { updateData } = require('../storage');

module.exports = (request, response) => {
  const id = decodeURIComponent(request.params.item_id);

  updateData(id, request.body);

  response.send(true);
};
