import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';

import { Block, BlocksState } from './state';
import { State as RootState } from '../state';

const { commit } = getStoreAccessors<BlocksState, RootState>('blocks');

const mutations = {
  addBlock(state: BlocksState, block: Block) {
    const id = `${block.serviceId}/${block.id}`;
    Vue.set(state.blocks, id, { ...block, isLoading: false });
  },

  updateBlock(state: BlocksState, block: Partial<Block>) {
    const id = `${block.serviceId}/${block.id}`;
    const existing = state.blocks[id];
    if (!existing) {
      throw new Error(`Block with id '${id}' does not exist`);
    }
    Vue.set(state.blocks, id, { ...existing, ...block });
  },

  updateBlockState(state: BlocksState, block: Partial<Block>) {
    mutations.updateBlock(state, block);
  },

  mutateBlock(state: BlocksState, block: Partial<Block>) {
    mutations.updateBlock(state, block);
  },

  blockLoading(state: BlocksState, id: string) {
    Vue.set(state.blocks, id, { ...state.blocks[id], isLoading: true });
  },

  mutateFetching(state: BlocksState, fetching: boolean) {
    state.fetching = fetching;
  },

  removeBlock(state: BlocksState, id: string) {
    Vue.delete(state.blocks, id);
  },
};

// exported commit accessors
export const addBlock = commit(mutations.addBlock);
export const updateBlockState = commit(mutations.updateBlockState);
export const mutateBlock = commit(mutations.mutateBlock);
export const blockLoading = commit(mutations.blockLoading);
export const mutateFetching = commit(mutations.mutateFetching);
export const removeBlock = commit(mutations.removeBlock);

export default mutations;
