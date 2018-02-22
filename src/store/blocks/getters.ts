import { getStoreAccessors } from 'vuex-typescript';

import store from '../';
import { Block, BlocksState } from './state';
import { State as RootState } from '../state';

const { read } = getStoreAccessors<BlocksState, RootState>('blocks');

const getters = {
  allBlocks(state: BlocksState): Block[] {
    return state.allIds.map(id => state.byId[id]);
  },
  isFetching(state: BlocksState): boolean {
    return state.fetching;
  },
};

const readIsFetching = read(getters.isFetching);
const readAllBlocks = read(getters.allBlocks);

export const allBlocks = () => readAllBlocks(store);
export const isFetching = () => readIsFetching(store);

export default getters;
