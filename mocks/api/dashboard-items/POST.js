const { updateData } = require('./storage');

let id = 1;

module.exports = (request, response) => {
  const item = {
    id: `new-item-${id}`,
    data: request.body.data,
  };

  response.send(JSON.stringify(item));

  updateData(item.id, item);

  id += 1;
};
