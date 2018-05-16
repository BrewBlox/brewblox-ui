const { update } = require('../storage');

module.exports = (request, response) => {
  response.send(JSON.stringify(update('settings', request.body)));
};
