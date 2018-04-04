import { getStoreAccessors } from 'vuex-typescript';

import {
  fetchBlock,
  fetchBlockMetrics,
  fetchBlocks as fetchBlocksFromApi,
  persistBlock as persistBlockToApi,
} from './api';

import { BlocksState, BlocksContext, BlockSaveBase } from './state';
import { State as RootState } from '../state';
import addBlockToStore from './add-block';

import {
  mutateBlock as mutateBlockInStore,
  mutateFetching as mutateFetchingInStore,
  blockLoading,
} from './mutations';

const { dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

const actions = {
  async findBlock(context: BlocksContext, id: string) {
    // will fetch a block from the server
    const block = await fetchBlock(id);

    // add block to store
    addBlockToStore(context, block);
  },
  async findBlockWithMetrics(context: BlocksContext, id: string) {
    // add block to store which is loading
    blockLoading(context, id);

    // will fetch a block from the server
    const blockMetrics = await fetchBlockMetrics(id);

    // update metric in store and unset loading
    mutateBlockInStore(context, {
      id,
      isLoading: false,
      metrics: blockMetrics.results,
    });
  },
  async fetchBlocks(context: BlocksContext) {
    // update isFetching
    mutateFetchingInStore(context, true);

    // will fetch blocks from the server
    const blocks = await fetchBlocksFromApi();
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
};

// exported action accessors
export const findBlock = dispatch(actions.findBlock);
export const findBlockWithMetrics = dispatch(actions.findBlockWithMetrics);
export const fetchBlocks = dispatch(actions.fetchBlocks);
export const saveBlock = dispatch(actions.saveBlock);

export default actions;
