import { getStoreAccessors } from 'vuex-typescript';

import store from '../';
import { Block, BlocksState } from './state';
import { State as RootState } from '../state';

const { read } = getStoreAccessors<BlocksState, RootState>('blocks');

const getters = {
  blocksById: (state: BlocksState): { [id: string]: Block } => state.byId,
  blockIds(state: BlocksState): string[] {
    return state.allIds;
  },
  allBlocks(state: BlocksState): Block[] {
    return state.allIds.map(id => state.byId[id]);
  },
  isFetching(state: BlocksState): boolean {
    return state.fetching;
  },
};

const readIsFetching = read(getters.isFetching);
const readAllBlocks = read(getters.allBlocks);
const readBlockIds = read(getters.blockIds);
const readBlocksById = read(getters.blocksById);

export const allBlocks = () => readAllBlocks(store);
export const blockIds = () => readBlockIds(store);
export const blockById = (id: string) => readBlocksById(store)[id];
export const isFetching = () => readIsFetching(store);

export default getters;
