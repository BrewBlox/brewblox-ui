import { getStoreAccessors } from 'vuex-typescript';

import { SettingsState } from './state';

import { State as RootState } from '../state';

const { commit } = getStoreAccessors<SettingsState, RootState>('settings');

const mutations = {
  mutateFetching(state: SettingsState, fetching: boolean) {
    state.fetching = fetching;
  },
};

// exported commit accessors
export const mutateFetching = commit(mutations.mutateFetching);

export default mutations;
