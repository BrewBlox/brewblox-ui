const { updateData } = require('./storage');

module.exports = (request, response) => {
  updateData(request.body);

  response.send(true);
};
