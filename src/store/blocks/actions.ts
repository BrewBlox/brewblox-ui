import { getStoreAccessors } from 'vuex-typescript';

import { Service } from '@/store/services/state';

import {
  fetchBlocks as fetchBlocksFromApi,
  persistBlock as persistBlockToApi,
  createBlock as createBlockOnApi,
} from './api';

import { BlocksState, BlocksContext, Block } from './state';
import { State as RootState } from '../state';

import {
  addBlock as addBlockInStore,
  mutateBlock as mutateBlockInStore,
  mutateFetching as mutateFetchingInStore,
} from './mutations';

const { dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

const actions = {
  async fetchBlocks(context: BlocksContext, services: Service[]) {
    // update isFetching
    mutateFetchingInStore(context, true);

    // will fetch blocks from the server
    const blocks = await fetchBlocksFromApi(services);
    blocks.forEach(block => addBlockInStore(context, block));

    // update isFetching
    mutateFetchingInStore(context, false);
  },

  async createBlock(context: BlocksContext, block: Block) {
    addBlockInStore(context, { ...block, isLoading: true });

    const createdBlock = await createBlockOnApi(block);

    mutateBlockInStore(context, { ...createdBlock, isLoading: false });

    return createdBlock;
  },

  async saveBlock(context: BlocksContext, block: Block) {
    // update isLoading and block values
    mutateBlockInStore(context, { ...block, isLoading: true });

    // persist block to API and wait for result
    const savedBlock = await persistBlockToApi(block);

    // update isLoading and apply block data from API
    mutateBlockInStore(context, { ...savedBlock, isLoading: false });
  },
};

// exported action accessors
export const fetchBlocks = dispatch(actions.fetchBlocks);
export const createBlock = dispatch(actions.createBlock);
export const saveBlock = dispatch(actions.saveBlock);

export default actions;
