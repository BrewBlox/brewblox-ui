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
    dashboards: {},
    items: {},
    settings: {
      primary: null,
    },
    fetching: true,
  },
};

export default dashboards;
