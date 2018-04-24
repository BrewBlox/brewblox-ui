import { ActionContext } from 'vuex';

import { State as RootState } from '../state';

interface DashboardProps {
  title: string;
  order: number;
  items: string[];
}

export interface Dashboard extends DashboardProps {
  id: string;
}

export interface DashboardAPI {
  id: string;
  data: DashboardProps;
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
  fetching: boolean,
};

export type DashboardContext = ActionContext<DashboardState, RootState>;
