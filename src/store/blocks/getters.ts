import { getStoreAccessors } from 'vuex-typescript';

import store from '../';
import { BlocksState } from './state';
import { State as RootState } from '../state';

const { read } = getStoreAccessors<BlocksState, RootState>('blocks');

const getters = {
  isFetching(state: BlocksState) {
    return state.fetching;
  },
};

const readIsFetching = read(getters.isFetching);

export const isFetching = () => readIsFetching(store);

export default getters;
