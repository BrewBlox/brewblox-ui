import { DashboardState } from './state';
import mutations from './mutations';

const { mutateFetching, addDashboard } = mutations;

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

describe('mutateFetching', () => {
  const fetchingStore = { ...defaultStore };

  it('Should correctly update fetching to true', () => {
    mutateFetching(fetchingStore, true);

    expect(fetchingStore.fetching).toBe(true);
  });

  it('Should correctly update fetching back to false', () => {
    mutateFetching(fetchingStore, false);

    expect(fetchingStore.fetching).toBe(false);
  });
});

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

  it('Should add another dashboard to the store', () => {
    const dashboard = {
      id: 'testing',
      title: 'Test Dashboard 2',
      order: 2,
      items: [],
    };

    addDashboard(dashboardStore, dashboard);

    // test if dashboard is added to list
    expect(dashboardStore.dashboards.allIds).toEqual(['test', 'testing']);
    // test if dashboard item is correct
    expect(dashboardStore.dashboards.byId['testing']).toEqual(dashboard);
  });
});
