import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';
import { merge } from 'lodash';

import { Block, BlocksState, BlockUpdate } from './state';
import { State as RootState } from '../state';
import store from '../index';

const { commit } = getStoreAccessors<BlocksState, RootState>('blocks');

const mutations = {
  addBlock(state: BlocksState, block: Block) {
    // add block to blocks list
    state.allIds.push(block.id);

    // insert data into blocks object
    state.byId[block.id] = block;
  },
  updateBlock(state: BlocksState, block: BlockUpdate) {
    if (!state.byId[block.id]) {
      throw new Error(`Block with id '${block.id}' does not exist`);
    }

    Vue.set(state, 'byId', Object.assign(
      {},
      state.byId,
      { [block.id]: merge(state.byId[block.id], block) },
    ));
  },
  removeBlock(state: BlocksState, id: string) {
    // delete from blocks listing
    Vue.delete(state.allIds, state.allIds.findIndex(block => block === id));

    // delete from data
    delete state.byId[id];
  },
  updateFetching(state: BlocksState, fetching: boolean) {
    state.fetching = fetching;
  },
};

// exported commit accessors
export const addBlock =
  (block: Block) => commit(mutations.addBlock)(store, block);

export const updateBlock =
  (block: BlockUpdate) => commit(mutations.updateBlock)(store, block);

export const updateFetching =
  (fetching: boolean) => commit(mutations.updateFetching)(store, fetching);

export default mutations;
