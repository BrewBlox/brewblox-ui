import { DashboardState } from './state';
import mutations from './mutations';

/* eslint-disable */
const {
  mutateFetching,
  addDashboard,
  addDashboardItem,
  setDashboardItemSize,
} = mutations;
/* eslint-enable */

const defaultStore: DashboardState = {
  dashboards: {},
  items: {},
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
    expect(dashboardStore.dashboards.test).toEqual(dashboard);
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
    expect(dashboardStore.dashboards.testing).toEqual(dashboard);
  });
});

describe('addDashboardItem', () => {
  const dashboardItemStore = { ...defaultStore };

  it('Should add a new dashboard item', () => {
    const dashboardItem = {
      id: 'test-item',
      cols: 2,
      rows: 3,
      widget: 'Empty',
      config: {},
    };

    addDashboardItem(dashboardItemStore, dashboardItem);

    // test if dashboard is added to list
    expect(dashboardItemStore.items.allIds).toEqual(['test-item']);
    // test if dashboard item is correct
    expect(dashboardItemStore.items['test-item']).toEqual(dashboardItem);
  });

  it('Should add another dashboard item', () => {
    const dashboardItem = {
      id: 'test-item-2',
      cols: 2,
      rows: 3,
      widget: 'Empty',
      config: {},
    };

    addDashboardItem(dashboardItemStore, dashboardItem);

    // test if dashboard is added to list
    expect(dashboardItemStore.items.allIds).toEqual(['test-item', 'test-item-2']);
    // test if dashboard item is correct
    expect(dashboardItemStore.items['test-item-2']).toEqual(dashboardItem);
  });
});

describe('setDashboardItemSize', () => {
  const dashboardItemSizeStore = { ...defaultStore };

  const dashboardItem = {
    id: 'test-item',
    cols: 2,
    rows: 3,
    widget: 'Empty',
    config: {},
  };

  it('Should update an item\'s size', () => {
    addDashboardItem(dashboardItemSizeStore, dashboardItem);

    setDashboardItemSize(dashboardItemSizeStore, { id: 'test-item', cols: 5, rows: 5 });

    expect(dashboardItemSizeStore.items['test-item'].cols).toBe(5);
    expect(dashboardItemSizeStore.items['test-item'].rows).toBe(5);
  });
});
