const list = require('../list/GET');
const metrics = require('../list/metrics');

module.exports = {
  getBlock(id) {
    return list.find(item => item.id === id);
  },
  getBlockMetrics(id) {
    return metrics.find(item => item.id === id);
  },
};
