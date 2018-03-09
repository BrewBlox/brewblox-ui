const { getBlockMetrics } = require('../helpers');

module.exports = (request, response) => {
  const id = decodeURIComponent(request.params.block_id);

  response.send(JSON.stringify(getBlockMetrics(id)));
};
