const { get } = require('../../storage');

module.exports = (request, response) => {
  const id = decodeURIComponent(request.params.controller_id);

  response.send(JSON.stringify(get(`objects.${id}`)));
};
