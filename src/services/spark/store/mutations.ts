import Vue from 'vue';
import {
  getStoreAccessors,
  MutationHandlerWithPayload,
  MutationHandlerNoPayload,
} from 'vuex-typescript';

import { State as RootState, RootStore } from '@/store/state';
import { BlocksState, BlocksContext } from './state';
import { Block } from '../state';

function commit<TPayload>(handler: MutationHandlerWithPayload<BlocksState, TPayload>) {
  return (store: RootStore | BlocksContext, serviceId: string, payload: TPayload) =>
    getStoreAccessors<BlocksState, RootState>(serviceId).commit(handler)(store, payload);
}

function noArgCommit(handler: MutationHandlerNoPayload<BlocksState>) {
  return (store: RootStore | BlocksContext, serviceId: string) =>
    getStoreAccessors<BlocksState, RootState>(serviceId).commit(handler)(store);
}

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
