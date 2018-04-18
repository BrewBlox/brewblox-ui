import { getStoreAccessors } from 'vuex-typescript';

import { Settings, SettingsState } from './state';
import { State as RootState } from '../state';

const { read } = getStoreAccessors<SettingsState, RootState>('settings');

const getters = {
  allSettings(state: SettingsState): Settings {
    return state.settings;
  },
  controllers(state: SettingsState): string[] {
    return state.settings.controllers;
  },
  isFetching(state: SettingsState): boolean {
    return state.fetching;
  },
};

// exported getter accessors
export const allSettings = read(getters.allSettings);
export const controllers = read(getters.controllers);
export const isFetching = read(getters.isFetching);

export default getters;
