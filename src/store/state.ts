import { BlocksState } from './blocks/state';
import { DashboardState } from './dashboards/state';
import { ServicesState } from './services/state';
import { SettingsState } from './settings/state';

export interface State {
  blocks: BlocksState;
  dashboards: DashboardState;
  services: ServicesState;
  settings: SettingsState;
}
