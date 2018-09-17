import { Store } from 'vuex';

import { BlocksState } from './blocks/state';
import { DashboardState } from './dashboards/state';
import { ServicesState } from './services/state';

export interface State {
  blocks: BlocksState;
  dashboards: DashboardState;
  services: ServicesState;
}

export type RootStore = Store<State>;
