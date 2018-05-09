import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';
import { merge } from 'lodash';

import { Block, BlocksState, BlockSave, BlockStateUpdate } from './state';
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
  updateBlockInStore(state: BlocksState, block: BlockStateUpdate | BlockSave) {
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
  updateBlockState(state: BlocksState, block: BlockStateUpdate) {
    mutations.updateBlockInStore(state, block);
  },
  mutateBlock(state: BlocksState, block: BlockSave) {
    mutations.updateBlockInStore(state, block);
  },
  mutateBlockId(state: BlocksState, { block, id }: { block: BlockSave, id: string }) {
    const oldId = `${block.serviceId}/${block.id}`;
    const targetId = `${block.serviceId}/${id}`;

    if (!state.byId[oldId]) {
      throw new Error(`Block with id '${oldId}' does not exist`);
    }

    // add block on new position
    const newById = Object.assign(
      {},
      state.byId,
      { [targetId]: merge(state.byId[oldId], block) },
    );

    // remove old entry
    delete newById[oldId];

    Vue.set(state, 'byId', newById);
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
export const mutateBlockId = commit(mutations.mutateBlockId);

export default mutations;
