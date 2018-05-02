const _ = require('lodash');

const { updateById } = require('../../storage');

module.exports = (request, response) => {
  response.send(JSON.stringify(updateById('dashboards', request.params.item_id, request.body)));
};
