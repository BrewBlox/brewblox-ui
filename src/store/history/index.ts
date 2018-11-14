import getters from './getters';
import actions from './actions';
import mutations from './mutations';

const features = {
  getters,
  actions,
  mutations,
  namespaced: true,
  strict: true,
  state: {
    availableFields: {},
    metrics: {},
  },
};

export default features;
