import Vue from 'vue';
import { ActionContext } from 'vuex';
import { getStoreAccessors } from 'vuex-typescript';

import { State as RootState } from '../state';
import { BlocksState, Block } from './state';

// modules
import { setpoints } from './setpoints';
import { SetPoint } from './setpoints/state';

export type BlocksContext = ActionContext<BlocksState, RootState>;

export const { commit, read, dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

export const blocks = {
  namespaced: true,
  state: {
    blocks: [],
    byId: {},
  },
  getters: {},
  mutations: {
    addBlock: (state: BlocksState, { block, data }: { block: Block, data: SetPoint }) => {
      state.blocks.push(block);
      state.byId[block.id] = { id: block.id, ...data };
    },
    removeBlock: (state: BlocksState, id: string) => {
      Vue.delete(state.blocks, state.blocks.findIndex(block => block.id === id));
    },
  },
  modules: {
    setpoints,
  },
};

export const addBlock = commit(blocks.mutations.addBlock);
export const removeBlock = commit(blocks.mutations.removeBlock);
