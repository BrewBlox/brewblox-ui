const base = require('./GET.json');
const { storage } = require('./storage');

module.exports = (request, response) => {
  response.send(JSON.stringify(
    [
      ...base,
      ...Object.keys(storage).map(key => storage[key])
    ],
  ));
};
