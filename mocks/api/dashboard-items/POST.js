const { updateById } = require('../storage');

let id = 1;

module.exports = (request, response) => {
  const item = {
    id: `new-item-${id}`,
    data: request.body.data,
  };

  updateById('dashboard-items', id, item);

  response.send(JSON.stringify(item));

  id += 1;
};
