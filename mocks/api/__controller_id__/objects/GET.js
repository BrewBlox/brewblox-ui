const base = require('./GET.json');
const base2 = require('./GET_2.json');

module.exports = (request, response) => {
  const id = decodeURIComponent(request.params.controller_id);

  if (id === 'controller-2') {
    return response.send(JSON.stringify(base2));
  }

  return response.send(JSON.stringify(base));
};
