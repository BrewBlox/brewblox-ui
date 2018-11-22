import { ActionContext } from 'vuex';
import { RootState } from '../state';

export interface Dashboard {
  id: string;
  title: string;
  order: number;
  primary?: boolean;
}

export interface DashboardItem {
  id: string;
  cols: number;
  rows: number;
  order: number;
  dashboard: string;
  widget: string;
  config: any;
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
