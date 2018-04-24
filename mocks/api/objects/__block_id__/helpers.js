const list = require('../GET.json');
const metrics = require('../metrics.json');

module.exports = {
  getBlock(id) {
    return list.find(item => item.id === id);
  },
  getBlockMetrics(id) {
    return metrics.find(item => item.id === id);
  },
};
