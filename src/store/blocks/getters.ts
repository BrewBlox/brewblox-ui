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

// exported getter accessors
export const allBlocks =
  () => read(getters.allBlocks)(store);

export const blockIds =
  () => read(getters.blockIds)(store);

export const blockById =
  (id: string) => read(getters.blocksById)(store)[id];

export const isFetching =
  () => read(getters.isFetching)(store);

export default getters;
