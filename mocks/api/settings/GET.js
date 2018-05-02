const { get } = require('../storage');

module.exports = (request, response) => {
  response.send(JSON.stringify(get('settings')));
};
