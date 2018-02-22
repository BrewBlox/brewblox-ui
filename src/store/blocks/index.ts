import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const blocks = {
  namespaced: true,
  strict: true,
  state: {
    allIds: [],
    byId: {},
    fetching: false,
  },
  getters,
  actions,
  mutations,
};

export default blocks;
