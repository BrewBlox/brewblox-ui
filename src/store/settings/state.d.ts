import { ActionContext } from 'vuex';

import { State as RootState } from '../state';


export type SettingsState = {
  fetching: boolean,
};

export type SettingsContext = ActionContext<SettingsState, RootState>;
