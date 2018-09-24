import getters from './getters';
import actions from './actions';
import mutations from './mutations';

const providers = {
  getters,
  actions,
  mutations,
  namespaced: true,
  strict: true,
  state: {
    providers: {},
    initialized: false,
  },
};

export default providers;
