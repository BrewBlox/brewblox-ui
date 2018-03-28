import { ActionContext } from 'vuex';

import { State as RootState } from '../state';

export interface Dashboard {
  id: string;
  title: string;
  order: number;
  items: string[];
}

export interface DashboardItem {
  id: string;
  order: number;
  cols: number;
  rows: number;
  widget: WidgetType;
  options: any;
}

export type DashboardState = {
  dashboards: {
    allIds: string[],
    byId: {
      [id: string]: Dashboard;
    },
  },
  items: {
    allIds: string[],
    byId: {
      [id: string]: DashboardItem;
    },
  },
};

export type DashboardContext = ActionContext<DashboardState, RootState>;
