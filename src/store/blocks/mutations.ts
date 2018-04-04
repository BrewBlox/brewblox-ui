import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';
import { merge } from 'lodash';

import { Block, BlocksState, BlockSave } from './state';
import { State as RootState } from '../state';

const { commit } = getStoreAccessors<BlocksState, RootState>('blocks');

const mutations = {
  addBlock(state: BlocksState, block: Block) {
    // add block to blocks list
    state.allIds.push(block.id);

    // insert data into blocks object
    state.byId[block.id] = { ...block, isLoading: false };
  },
  mutateBlock(state: BlocksState, block: BlockSave) {
    if (!state.byId[block.id]) {
      throw new Error(`Block with id '${block.id}' does not exist`);
    }

    Vue.set(state, 'byId', Object.assign(
      {},
      state.byId,
      { [block.id]: merge(state.byId[block.id], block) },
    ));
  },
  blockLoading(state: BlocksState, id: string) {
    Vue.set(state, 'byId', Object.assign(
      {},
      state.byId,
      { [id]: merge(state.byId[id], { isLoading: true }) },
    ));
  },
  mutateFetching(state: BlocksState, fetching: boolean) {
    state.fetching = fetching;
  },
  removeBlock(state: BlocksState, id: string) {
    // delete from blocks listing
    Vue.delete(state.allIds, state.allIds.findIndex(block => block === id));

    // delete from data
    delete state.byId[id];
  },
};

// exported commit accessors
export const addBlock = commit(mutations.addBlock);
export const mutateBlock = commit(mutations.mutateBlock);
export const blockLoading = commit(mutations.blockLoading);
export const mutateFetching = commit(mutations.mutateFetching);

export default mutations;
