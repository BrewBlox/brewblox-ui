import actions from './actions';
import mutations from './mutations';

export const blocks = {
  namespaced: true,
  strict: true,
  state: {
    blocks: [],
    byId: {},
  },
  getters: {},
  actions,
  mutations,
};
