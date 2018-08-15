import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';
import { merge } from 'lodash';

import { Block, BlocksState } from './state';
import { State as RootState } from '../state';

const { commit } = getStoreAccessors<BlocksState, RootState>('blocks');

const mutations = {
  addBlock(state: BlocksState, block: Block) {
    const id = `${block.serviceId}/${block.id}`;

    // add block to blocks list
    state.allIds.push(id);

    // insert data into blocks object
    state.byId[id] = { ...block, isLoading: false };
  },

  updateBlockInStore(state: BlocksState, block: Block) {
    const id = `${block.serviceId}/${block.id}`;

    if (!state.byId[id]) {
      throw new Error(`Block with id '${id}' does not exist`);
    }

    Vue.set(state, 'byId', Object.assign(
      {},
      state.byId,
      { [id]: merge(state.byId[id], block) },
    ));
  },

  updateBlockState(state: BlocksState, block: Block) {
    mutations.updateBlockInStore(state, block);
  },

  mutateBlock(state: BlocksState, block: Block) {
    mutations.updateBlockInStore(state, block);
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
export const updateBlockState = commit(mutations.updateBlockState);
export const mutateBlock = commit(mutations.mutateBlock);
export const blockLoading = commit(mutations.blockLoading);
export const mutateFetching = commit(mutations.mutateFetching);

export default mutations;
