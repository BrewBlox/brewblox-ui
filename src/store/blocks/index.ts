import Vue from 'vue';
import { ActionContext } from 'vuex';
import { getStoreAccessors } from 'vuex-typescript';

import { State as RootState } from '../state';
import { BlocksState, Block } from './state';

export type BlocksContext = ActionContext<BlocksState, RootState>;

export const { commit, read, dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

export const blocks = {
  namespaced: true,
  strict: true,
  state: {
    blocks: [],
    byId: {},
  },
  getters: {},
  mutations: {
    addBlock: (state: BlocksState, block: Block) => {
      // add block to blocks list
      state.blocks.push(block.id);

      // insert data into blocks object
      state.byId[block.id] = block;
    },
    removeBlock: (state: BlocksState, id: string) => {
      // delete from blocks listing
      Vue.delete(state.blocks, state.blocks.findIndex(block => block === id));

      // delete from data
      delete state.byId[id];
    },
  },
};
