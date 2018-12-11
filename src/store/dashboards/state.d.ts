import { ActionContext } from 'vuex';
import { RootState } from '../state';

export interface Dashboard {
  id: string;
  title: string;
  order: number;
  primary?: boolean;
  _rev?: string;
}

export interface DashboardItem {
  id: string;
  cols: number;
  rows: number;
  order: number;
  dashboard: string;
  feature: string;
  config: any;
  _rev?: string;
}

export type DashboardState = {
  dashboards: {
    [id: string]: Dashboard;
  };
  items: {
    [id: string]: DashboardItem;
  };
};

export type DashboardContext = ActionContext<DashboardState, RootState>;
