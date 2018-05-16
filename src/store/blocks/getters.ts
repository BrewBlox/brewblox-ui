import { getStoreAccessors } from 'vuex-typescript';

import { Block, BlocksState } from './state';
import { State as RootState, RootStore } from '../state';
import { SetPointSimpleBlock } from '@/store/blocks/SetPointSimple/SetPointSimple';

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

// exported getter accessors
export const allBlocks = read(getters.allBlocks);
export const blockIds = read(getters.blockIds);
const blocksById = read(getters.blocksById);
export const blockById = (store: RootStore, id: string) => blocksById(store)[id];
export const isFetching = read(getters.isFetching);
export const allBlockFromService = (store: RootStore, serviceId: string): Block[] =>
  allBlocks(store).filter(block => block.serviceId === serviceId);

export default getters;
