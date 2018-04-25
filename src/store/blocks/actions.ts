import { getStoreAccessors } from 'vuex-typescript';

import { Service } from '@/store/services/state';

import {
  fetchBlockMetrics,
  fetchBlocks as fetchBlocksFromApi,
  persistBlock as persistBlockToApi,
  updateBlock as updateBlockToApi,
} from './api';

import { BlocksState, BlocksContext, BlockSaveBase, BlockBase } from './state';
import { State as RootState } from '../state';
import addBlockToStore from './add-block';

import {
  mutateBlock as mutateBlockInStore,
  mutateFetching as mutateFetchingInStore,
  blockLoading,
} from './mutations';

const { dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

const actions = {
  async fetchBlocks(context: BlocksContext, services: Service[]) {
    // update isFetching
    mutateFetchingInStore(context, true);

    // will fetch blocks from the server
    const blocks = await fetchBlocksFromApi(services);
    blocks.forEach(block => addBlockToStore(context, block));

    // update isFetching
    mutateFetchingInStore(context, false);
  },
  async saveBlock(context: BlocksContext, block: BlockSaveBase) {
    // update isLoading and block values
    mutateBlockInStore(context, { ...block, isLoading: true });

    // persist block to API and wait for result
    const savedBlock = await persistBlockToApi(block);

    // update isLoading and apply block data from API
    mutateBlockInStore(context, { ...savedBlock, isLoading: false });
  },
  async updateBlock(context: BlocksContext, block: BlockBase & any) {
    // update isLoading and block values
    mutateBlockInStore(context, { ...block, isLoading: true });

    // persist block to API and wait for result
    const savedBlock = await updateBlockToApi(block);

    // update isLoading and apply block data from API
    mutateBlockInStore(context, { ...savedBlock, isLoading: false });
  },
};

// exported action accessors
export const fetchBlocks = dispatch(actions.fetchBlocks);
export const saveBlock = dispatch(actions.saveBlock);
export const updateBlock = dispatch(actions.updateBlock);

export default actions;
