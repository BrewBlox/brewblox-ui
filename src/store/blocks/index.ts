import { ActionContext } from 'vuex';

import { State as RootState } from '../state';
import { BlocksState } from './blocksState';

type BlocksContext = ActionContext<BlocksState, RootState>;

export default {
  namespaced: true,
  state: [],
  mutations: {
    ADD_TODO(state: BlocksState) {
      state.push({
        id: 'test',
        type: 'test',
      });
    },
  },
  actions: {
    ADD_TODO({ commit }: BlocksContext) {
      commit('ADD_TODO');
    },
  },
};
