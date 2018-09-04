import getters from './getters';
import actions from './actions';
import mutations from './mutations';

const settings = {
  getters,
  actions,
  mutations,
  namespaced: true,
  strict: true,
  state: {
    settings: {},
    fetching: true,
  },
};

export default settings;
