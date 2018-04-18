import { getStoreAccessors } from 'vuex-typescript';

import { Settings, SettingsState } from './state';

import { State as RootState } from '../state';

const { commit } = getStoreAccessors<SettingsState, RootState>('settings');

const mutations = {
  setSettings(state: SettingsState, settings: Settings) {
    state.settings = settings;
  },
  mutateFetching(state: SettingsState, fetching: boolean) {
    state.fetching = fetching;
  },
};

// exported commit accessors
export const mutateFetching = commit(mutations.mutateFetching);
export const setSettings = commit(mutations.setSettings);

export default mutations;
