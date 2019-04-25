import { commit } from '@/helpers/dynamic-store';
import Vue from 'vue';
import { MutationTree } from 'vuex';
import { Block, UnitAlternatives, UserUnits, SystemStatus } from '../state';
import { SparkState } from './state';

export const mutations: MutationTree<SparkState> = {
  addBlock: (state: SparkState, block: Block) =>
    Vue.set(state.blocks, block.id, { ...block }),

  updateBlock: (state: SparkState, block: Partial<Block>) => {
    const id = block.id || '';
    const existing = state.blocks[id];
    if (!existing) {
      throw new Error(`Block with id '${id}' does not exist`);
    }
    Vue.set(state.blocks, id, { ...existing, ...block });
  },

  mutateBlock: (state: SparkState, block: Partial<Block>) =>
    mutations.updateBlock(state, block),

  removeBlock: (state: SparkState, id: string) =>
    Vue.delete(state.blocks, id),

  setBlocks: (state: SparkState, blocks: Block[]) => {
    Vue.set(state, 'blocks', blocks.reduce((acc, block) => ({ ...acc, [block.id]: block }), {}));
  },

  setUnits: (state: SparkState, units: UserUnits) =>
    Vue.set(state, 'units', units),

  setUnitAlternatives: (state: SparkState, alts: UnitAlternatives) =>
    Vue.set(state, 'unitAlternatives', alts),

  setCompatibleBlocks: (state: SparkState, { type, ids }: { type: string; ids: string[] }) =>
    Vue.set(state.compatibleBlocks, type, ids),

  setDiscoveredBlocks: (state: SparkState, ids: string[]) =>
    Vue.set(state, 'discoveredBlocks', ids),

  setUpdateSource: (state: SparkState, source: EventSource) =>
    Vue.set(state, 'updateSource', source),

  setLastStatus: (state: SparkState, status: SystemStatus) =>
    Vue.set(state, 'lastStatus', status),
};

export const addBlock = commit(mutations.addBlock);
export const mutateBlock = commit(mutations.mutateBlock);
export const removeBlock = commit(mutations.removeBlock);
export const setBlocks = commit(mutations.setBlocks);
export const setUnits = commit(mutations.setUnits);
export const setUnitAlternatives = commit(mutations.setUnitAlternatives);
export const setCompatibleBlocks = commit(mutations.setCompatibleBlocks);
export const setDiscoveredBlocks = commit(mutations.setDiscoveredBlocks);
export const setUpdateSource = commit(mutations.setUpdateSource);
export const setLastStatus = commit(mutations.setLastStatus);
