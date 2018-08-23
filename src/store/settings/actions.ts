import { getStoreAccessors } from 'vuex-typescript';

import { SettingsContext, SettingsState } from './state';
import { State as RootState } from '../state';

import {
  fetchSettings as fetchSettingsFromApi,
  persistSettings as persistSettingsOnApi,
} from './api';

import {
  mutateFetching as mutateFetchingInStore,
  setSettings as setSettingsInStore,
  addController as addControllerInStore,
  removeController as removeControllerFromStore,
} from './mutations';

const { dispatch } = getStoreAccessors<SettingsState, RootState>('settings');

const actions = {
  addController(context: SettingsContext, controller: string) {
    // persist new settings
    persistSettingsOnApi({
      ...context.state.settings,
      controllers: [...context.state.settings.controllers, controller],
    });

    // add controller to store
    addControllerInStore(context, controller);
  },

  removeController(context: SettingsContext, controller: string) {
    // persist new settings
    persistSettingsOnApi({
      ...context.state.settings,
      controllers:
        [...context.state.settings.controllers]
          .filter(stateController => controller !== stateController),
    });

    // remove controller from store
    removeControllerFromStore(context, controller);
  },

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
export const addController = dispatch(actions.addController);
export const removeController = dispatch(actions.removeController);

export default actions;
