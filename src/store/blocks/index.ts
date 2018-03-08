import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const blocks = {
  getters,
  actions,
  mutations,
  namespaced: true,
  strict: true,
  state: {
    allIds: [],
    byId: {},
    fetching: false,
  },
};

export default blocks;
