import { getStoreAccessors } from 'vuex-typescript';

import { SettingsContext, SettingsState } from './state';
import { State as RootState } from '../state';

import { fetchSettings as fetchSettingsFromApi } from './api';

import {
  mutateFetching as mutateFetchingInStore,
  setSettings as setSettingsInStore,
} from './mutations';

const { dispatch } = getStoreAccessors<SettingsState, RootState>('settings');

const actions = {
  async fetchSettings(context: SettingsContext) {
    // update isFetching
    mutateFetchingInStore(context, true);

    // fetch and set settings
    const settings = await fetchSettingsFromApi();

    // set settings in the store
    setSettingsInStore(context, settings);

    // update isFetching
    mutateFetchingInStore(context, false);
  },
};

// exported action accessors
export const fetchSettings = dispatch(actions.fetchSettings);

export default actions;
