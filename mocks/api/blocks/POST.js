const { merge } = require('lodash');

module.exports = base => (request, response) => {
  response.send(JSON.stringify(merge(base, request.body)));
};
