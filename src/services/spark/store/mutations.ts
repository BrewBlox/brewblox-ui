import Vue from 'vue';

import { commit, noArgCommit } from '@/helpers/store-accessors';
import { BlocksState } from './state';
import { Block } from '../state';

const mutations = {
  addBlock(state: BlocksState, block: Block) {
    Vue.set(state.blocks, block.id, { ...block, isLoading: false });
  },

  updateBlock(state: BlocksState, block: Partial<Block>) {
    const id = block.id || '';
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

  clearBlocks(state: BlocksState) {
    Vue.set(state, 'blocks', {});
  },
};

export const addBlock = commit(mutations.addBlock);
export const updateBlockState = commit(mutations.updateBlockState);
export const mutateBlock = commit(mutations.mutateBlock);
export const blockLoading = commit(mutations.blockLoading);
export const mutateFetching = commit(mutations.mutateFetching);
export const removeBlock = commit(mutations.removeBlock);
export const clearBlocks = noArgCommit(mutations.clearBlocks);

export default mutations;
