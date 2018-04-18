import { getStoreAccessors } from 'vuex-typescript';

import { Settings, SettingsState } from './state';

import { State as RootState } from '../state';

const { commit } = getStoreAccessors<SettingsState, RootState>('settings');

const mutations = {
  addController(state: SettingsState, controller: string) {
    state.settings = {
      ...state.settings,
      controllers: [...state.settings.controllers, controller],
    };
  },
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
export const addController = commit(mutations.addController);

export default mutations;
