import { getStoreAccessors } from 'vuex-typescript';

import { Service } from '@/store/services/state';

import {
  fetchBlocks as fetchBlocksFromApi,
  persistBlock as persistBlockToApi,
  createBlock as createBlockOnApi,
  deleteBlock as deleteBlockOnApi,
} from './api';

import { BlocksState, BlocksContext, Block } from './state';
import { State as RootState } from '../state';

import {
  addBlock as addBlockInStore,
  mutateBlock as mutateBlockInStore,
  mutateFetching as mutateFetchingInStore,
  removeBlock as removeBlockInStore,
} from './mutations';

const { dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

const actions = {
  async fetchBlocks(context: BlocksContext, services: Service[]) {
    mutateFetchingInStore(context, true);
    const blocks = await fetchBlocksFromApi(services);
    blocks.forEach(block => addBlockInStore(context, block));
    mutateFetchingInStore(context, false);
  },

  async createBlock(context: BlocksContext, block: Block) {
    addBlockInStore(context, { ...block, isLoading: true });
    const createdBlock = await createBlockOnApi(block);
    mutateBlockInStore(context, { ...createdBlock, isLoading: false });

    return createdBlock;
  },

  async saveBlock(context: BlocksContext, block: Block) {
    mutateBlockInStore(context, { ...block, isLoading: true });
    const savedBlock = await persistBlockToApi(block);
    mutateBlockInStore(context, { ...savedBlock, isLoading: false });
  },

  async removeBlock(context: BlocksContext, block: Block) {
    mutateBlockInStore(context, { ...block, isLoading: true });
    await deleteBlockOnApi(block);
    removeBlockInStore(context, block.id);
  },
};

// exported action accessors
export const fetchBlocks = dispatch(actions.fetchBlocks);
export const createBlock = dispatch(actions.createBlock);
export const saveBlock = dispatch(actions.saveBlock);
export const removeBlock = dispatch(actions.removeBlock);

export default actions;
