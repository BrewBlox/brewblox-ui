import Vue from 'vue';
import { commit, noArgCommit } from '@/helpers/dynamic-store';
import { SparkState } from './state';
import { Block, UserUnits, UnitAlternatives } from '../state';

const mutations = {
  addBlock: (state: SparkState, block: Block) =>
    Vue.set(state.blocks, block.id, { ...block, isLoading: false }),

  updateBlock: (state: SparkState, block: Partial<Block>) => {
    const id = block.id || '';
    const existing = state.blocks[id];
    if (!existing) {
      throw new Error(`Block with id '${id}' does not exist`);
    }
    Vue.set(state.blocks, id, { ...existing, ...block });
  },

  updateBlockState: (state: SparkState, block: Partial<Block>) =>
    mutations.updateBlock(state, block),

  mutateBlock: (state: SparkState, block: Partial<Block>) =>
    mutations.updateBlock(state, block),

  blockLoading: (state: SparkState, id: string) =>
    Vue.set(state.blocks, id, { ...state.blocks[id], isLoading: true }),

  mutateFetching: (state: SparkState, fetching: boolean) => {
    state.fetching = fetching;
  },

  removeBlock: (state: SparkState, id: string) =>
    Vue.delete(state.blocks, id),

  clearBlocks: (state: SparkState) =>
    Vue.set(state, 'blocks', {}),

  setUnits: (state: SparkState, units: UserUnits) =>
    Vue.set(state, 'units', units),

  setUnitAlternatives: (state: SparkState, alts: UnitAlternatives) =>
    Vue.set(state, 'unitAlternatives', alts),
};

export const addBlock = commit(mutations.addBlock);
export const updateBlockState = commit(mutations.updateBlockState);
export const mutateBlock = commit(mutations.mutateBlock);
export const blockLoading = commit(mutations.blockLoading);
export const mutateFetching = commit(mutations.mutateFetching);
export const removeBlock = commit(mutations.removeBlock);
export const clearBlocks = noArgCommit(mutations.clearBlocks);
export const setUnits = commit(mutations.setUnits);
export const setUnitAlternatives = commit(mutations.setUnitAlternatives);

export default mutations;
