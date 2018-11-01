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
    features: {},
  },
};

export default features;
