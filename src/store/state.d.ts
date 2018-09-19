import { Store } from 'vuex';
import { DashboardState } from './dashboards/state';
import { ServicesState } from './services/state';

export interface State {
  dashboards: DashboardState;
  services: ServicesState;
}

export type RootStore = Store<State>;
