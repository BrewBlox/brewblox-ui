import actions from './actions';
import mutations from './mutations';

export const blocks = {
  namespaced: true,
  strict: true,
  state: {
    allIds: [],
    byId: {},
  },
  getters: {},
  actions,
  mutations,
};
