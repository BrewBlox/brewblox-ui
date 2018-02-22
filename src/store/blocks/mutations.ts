import Vue from 'vue';
import { getStoreAccessors } from 'vuex-typescript';

// import { commit } from './';
import { Block, BlocksState, BlockUpdate } from './state';
import { State as RootState } from '../state';

const { commit } = getStoreAccessors<BlocksState, RootState>('blocks');

const mutations = {
  addBlock(state: BlocksState, block: Block) {
    // add block to blocks list
    state.blocks.push(block.id);

    // insert data into blocks object
    state.byId[block.id] = block;
  },
  updateBlock(state: BlocksState, block: BlockUpdate) {
    if (!state.byId[block.id]) {
      throw new Error(`Block with id '${block.id}' does not exist`);
    }

    state.byId[block.id] = Object.assign(state.byId[block.id], block);
  },
  removeBlock(state: BlocksState, id: string) {
    // delete from blocks listing
    Vue.delete(state.blocks, state.blocks.findIndex(block => block === id));

    // delete from data
    delete state.byId[id];
  },
};

export const commitAddBlock = commit(mutations.addBlock);
export const commitUpdateBlock = commit(mutations.updateBlock);

export default mutations;
