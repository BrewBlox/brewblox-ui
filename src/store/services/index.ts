import getters from './getters';
import actions from './actions';
import mutations from './mutations';

const services = {
  getters,
  actions,
  mutations,
  namespaced: true,
  strict: true,
  state: {
    services: {},
    fetching: false,
  },
};

export default services;
