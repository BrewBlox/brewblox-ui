import { DashboardState } from './state';
import mutations from './mutations.helpers';

const { addDashboard } = mutations;

const defaultStore: DashboardState = {
  dashboards: {
    allIds: [],
    byId: {},
  },
  items: {
    allIds: [],
    byId: {},
  },
  fetching: false,
};

describe('addDashboard', () => {
  const dashboardStore = { ...defaultStore };

  it('Should add a dashboard to the store', () => {
    const dashboard = {
      id: 'test',
      title: 'Test Dashboard',
      order: 1,
      items: [],
    };

    addDashboard(dashboardStore, dashboard);

    // test if dashboard is added to list
    expect(dashboardStore.dashboards.allIds).toEqual(['test']);
    // test if dashboard item is correct
    expect(dashboardStore.dashboards.byId['test']).toEqual(dashboard);
  });
});
