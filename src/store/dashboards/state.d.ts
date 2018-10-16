import { ActionContext } from 'vuex';

import { RootState } from '../state';

export interface Dashboard {
  id: string;
  title: string;
  order: number;
  items: string[];
}

export interface DashboardItem {
  id: string;
  cols: number;
  rows: number;
  widget: string;
  config: any;
}

export type DashboardState = {
  dashboards: {
    [id: string]: Dashboard;
  },
  items: {
    [id: string]: DashboardItem;
  },
  fetching: boolean,
  defaultDashboard: string | null;
};

export type DashboardContext = ActionContext<DashboardState, RootState>;
