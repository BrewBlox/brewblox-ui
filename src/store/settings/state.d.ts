import { ActionContext } from 'vuex';

import { State as RootState } from '../state';

interface Settings {
  controllers: string[];
}

export type SettingsState = {
  fetching: boolean,
  settings: Settings,
};

export type SettingsContext = ActionContext<SettingsState, RootState>;
