import { Store } from 'vuex';
import { ServiceState } from './services/state';

export interface RootState {
  services: ServiceState;
}

export type RootStore = Store<RootState>;
