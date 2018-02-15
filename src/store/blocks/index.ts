import Vue from 'vue';
import { ActionContext } from 'vuex';
import { getStoreAccessors } from 'vuex-typescript';

import { State as RootState } from '../state';
import { BlocksState, Block } from './state';

type BlocksContext = ActionContext<BlocksState, RootState>;

export const { commit, read, dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

export const blocks = {
  namespaced: true,
  state: [],
  mutations: {
    addBlock: (state: BlocksState, block: Block) => {
      state.push(block);
    },
    removeBlock: (state: BlocksState, id: string) => {
      Vue.delete(state, state.findIndex(block => block.id === id));
    },
  },
};

