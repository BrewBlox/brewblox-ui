const { updateById } = require('../storage');

let id = 1;

module.exports = (request, response) => {
  const item = {
    id: `new-item-${id}`,
    data: request.body.data,
  };

  response.send(JSON.stringify(updateById('dashboard-items', id, item)));

  id += 1;
};
