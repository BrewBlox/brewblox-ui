const list = require('../list/GET');

module.exports = {
  getBlock(id) {
    return list.find(item => item.id === id);
  },
};
