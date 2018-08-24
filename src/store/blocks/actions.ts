import { getStoreAccessors } from 'vuex-typescript';

import { Service } from '@/store/services/state';

import {
  fetchBlocks as fetchBlocksFromApi,
  persistBlock as persistBlockToApi,
  createBlock as createBlockOnApi,
  deleteBlock as deleteBlockOnApi,
  clearBlocks as clearBlocksOnApi,
} from './api';

import { BlocksState, BlocksContext, Block } from './state';
import { State as RootState } from '../state';

import { allBlocksFromService } from './getters';

import {
  addBlock as addBlockInStore,
  mutateBlock as mutateBlockInStore,
  mutateFetching as mutateFetchingInStore,
  removeBlock as removeBlockInStore,
} from './mutations';

const { dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

const actions = {
  async fetchBlocks(context: BlocksContext, service: Service) {
    mutateFetchingInStore(context, true);
    const blocks = await fetchBlocksFromApi(service);
    blocks.forEach(block => addBlockInStore(context, block));
    // Remove all blocks not currently present on service
    const blockIds = blocks.map(block => block.id);
    allBlocksFromService(context, service.id)
      .filter(block => blockIds.includes(block.id))
      .forEach(block => removeBlockInStore(context, block.id));
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

  async clearBlocks(context: BlocksContext, service: Service) {
    await clearBlocksOnApi(service.id);
    await actions.fetchBlocks(context, service);
  },
};

// exported action accessors
export const fetchBlocks = dispatch(actions.fetchBlocks);
export const createBlock = dispatch(actions.createBlock);
export const saveBlock = dispatch(actions.saveBlock);
export const removeBlock = dispatch(actions.removeBlock);
export const clearBlocks = dispatch(actions.clearBlocks);

export default actions;
