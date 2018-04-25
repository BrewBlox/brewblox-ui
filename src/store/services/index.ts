// import getters from './getters';
import actions from './actions';
import mutations from './mutations';

const services = {
  // getters,
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

export default services;
