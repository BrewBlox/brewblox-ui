import { getStoreAccessors } from 'vuex-typescript';

import { SettingsContext, SettingsState } from './state';
import { State as RootState } from '../state';

import { mutateFetching as mutateFetchingInStore } from './mutations';

const { dispatch } = getStoreAccessors<SettingsState, RootState>('settings');

const actions = {
  async fetchSettings(context: SettingsContext) {
    // update isFetching
    mutateFetchingInStore(context, true);

    // fetch and set settings

    // update isFetching
    mutateFetchingInStore(context, false);
  },
};

// exported action accessors
export const fetchSettings = dispatch(actions.fetchSettings);

export default actions;
