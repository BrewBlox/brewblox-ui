const list = require('../GET.json');
const list2 = require('../GET_2.json');
const metrics = require('../metrics.json');

module.exports = {
  getBlock(id, controllerId) {
    return (controllerId === 'controller-1' ? list : list2).find(item => item.id === id);
  },
  getBlockMetrics(id) {
    return metrics.find(item => item.id === id);
  },
};
