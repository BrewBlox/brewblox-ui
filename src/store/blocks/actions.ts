import { getStoreAccessors } from 'vuex-typescript';

import { fetchBlock, fetchBlocks, persistBlock as persistBlockToApi } from './api';

import store from '../';
import { BlocksState, BlocksContext, BlockSaveBase } from './state';
import { State as RootState } from '../state';
import addBlockToStore from './add-block';

import {
  mutateBlock as mutateBlockInStore,
  mutateFetching as mutateFetchingInStore,
} from './mutations';

const { dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

const actions = {
  async findBlock(context: BlocksContext, id: string) {
    // will fetch a block from the server
    const block = await fetchBlock(id);

    // add block to store
    addBlockToStore(block);
  },
  async listBlocks() {
    // update isFetching
    mutateFetchingInStore(true);

    // will fetch blocks from the server
    const blocks = await fetchBlocks();
    blocks.forEach(addBlockToStore);

    // update isFetching
    mutateFetchingInStore(false);
  },
  async saveBlock(context: BlocksContext, block: BlockSaveBase) {
    // update isLoading and block values
    mutateBlockInStore({ ...block, isLoading: true });

    // persist block to API and wait for result
    const savedBlock = await persistBlockToApi(block);

    // update isLoading and apply block data from API
    mutateBlockInStore({ ...savedBlock, isLoading: false });
  },
};

// exported action accessors
export const findBlock =
  (id: string) => dispatch(actions.findBlock)(store, id);

export const listBlocks =
  () => dispatch(actions.listBlocks)(store);

export const saveBlock =
  (block: BlockSaveBase) => dispatch(actions.saveBlock)(store, block);

export default actions;
