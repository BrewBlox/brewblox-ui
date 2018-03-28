import { BlocksState } from './blocks/state';
import { DashboardState } from './dashboards/state';

export interface State {
  blocks: BlocksState;
  dashboards: DashboardState;
}
