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
    persistSettingsOnApi({
      ...context.state.settings,
      controllers: [...context.state.settings.controllers, controller],
    });
    addControllerInStore(context, controller);
  },

  removeController(context: SettingsContext, controller: string) {
    persistSettingsOnApi({
      ...context.state.settings,
      controllers:
        [...context.state.settings.controllers]
          .filter(stateController => controller !== stateController),
    });
    removeControllerFromStore(context, controller);
  },

  async fetchSettings(context: SettingsContext) {
    mutateFetchingInStore(context, true);
    const settings = await fetchSettingsFromApi();
    setSettingsInStore(context, settings);
    mutateFetchingInStore(context, false);
  },
};

// exported action accessors
export const fetchSettings = dispatch(actions.fetchSettings);
export const addController = dispatch(actions.addController);
export const removeController = dispatch(actions.removeController);

export default actions;
