import Vue from 'vue';
import { ActionContext } from 'vuex';
import { getStoreAccessors } from 'vuex-typescript';

import { State as RootState } from '../state';
import { BlocksState, Block } from './state';

// modules
import { setpoints } from './setpoints';

export type BlocksContext = ActionContext<BlocksState, RootState>;

export const { commit, read, dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

export const blocks = {
  namespaced: true,
  state: {
    blocks: [],
    byId: {},
  },
  mutations: {
    addBlock: (state: BlocksState, block: Block) => {
      state.blocks.push(block);
    },
    removeBlock: (state: BlocksState, id: string) => {
      Vue.delete(state.blocks, state.blocks.findIndex(block => block.id === id));
    },
  },
  modules: {
    setpoints,
  },
};

