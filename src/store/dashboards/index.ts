import getters from './getters';
import actions from './actions';
import mutations from './mutations';

const dashboards = {
  getters,
  actions,
  mutations,
  namespaced: true,
  strict: true,
  state: {
    dashboards: {
      allIds: [],
      byId: {},
    },
    items: {
      allIds: [],
      byId: {},
    },
    fetching: false,
  },
};

export default dashboards;
