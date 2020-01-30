import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import store from '@/store';

import { dashboardApi, widgetApi } from './api';
import { Dashboard, Widget } from './types';

export * from './types';

const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'dashboards' })
export class DashboardModule extends VuexModule {
  public dashboards: Mapped<Dashboard> = {};
  public widgets: Mapped<Widget> = {};

  public get dashboardIds(): string[] {
    return Object.keys(this.dashboards);
  }

  public get dashboardValues(): Dashboard[] {
    return Object.values(this.dashboards);
  }

  public get widgetIds(): string[] {
    return Object.keys(this.widgets);
  }

  public get widgetValues(): Widget[] {
    return Object.values(this.widgets);
  }

  public get primaryDashboardId(): string | null {
    const sorted = Object
      .values(this.dashboards)
      .sort((left, right) => {
        if (left.primary && !right.primary) {
          return -1;
        }
        if (!left.primary && right.primary) {
          return 1;
        }
        return left.order - right.order;
      });
    return sorted.length > 0
      ? sorted[0].id
      : null;
  }

  public get dashboardById(): (id: string) => Dashboard {
    return id => this.dashboards[id] ?? null;
  }

  public get widgetById(): (id: string) => Widget {
    return id => this.widgets[id] ?? null;
  }

  public get dashboardWidgets(): (id: string) => Widget[] {
    return id => this.widgetValues.filter(widget => widget.dashboard === id);
  }

  @Mutation
  public commitDashboard(dashboard: Dashboard): void {
    Vue.set(this.dashboards, dashboard.id, { ...dashboard });
  }

  @Mutation
  public commitAllDashboards(dashboards: Dashboard[]): void {
    this.dashboards = dashboards.reduce(objReducer('id'), {});
  }

  @Mutation
  public commitRemoveDashboard(dashboard: Dashboard): void {
    Vue.delete(this.dashboards, dashboard.id);
  }

  @Mutation
  public commitWidget(widget: Widget): void {
    Vue.set(this.widgets, widget.id, { ...widget });
  }

  @Mutation
  public commitAllWidgets(widgets: Widget[]): void {
    this.widgets = widgets.reduce(objReducer('id'), {});
  }

  @Mutation
  public commitRemoveWidget(widget: Widget): void {
    Vue.delete(this.widgets, widget.id);
  }

  @Action({ rawError })
  public async createDashboard(dashboard: Dashboard): Promise<void> {
    this.commitDashboard(await dashboardApi.create(dashboard));
  }

  @Action({ rawError })
  public async saveDashboard(dashboard: Dashboard): Promise<void> {
    this.commitDashboard(await dashboardApi.persist(dashboard));
  }

  @Action({ rawError })
  public async updateDashboardOrder(ids: string[]): Promise<void> {
    await Promise.all(
      ids
        .map(id => this.dashboards[id])
        .map((dashboard, idx) => this.saveDashboard({ ...dashboard, order: idx + 1 }))
    );
  }

  @Action({ rawError })
  public async updatePrimaryDashboard(newId: string | null): Promise<void> {
    await Promise.all(
      this.dashboardValues
        .map((dash: Dashboard) => {
          if (dash.id === newId && !dash.primary) {
            return this.saveDashboard({ ...dash, primary: true });
          } else if (dash.primary) {
            return this.saveDashboard({ ...dash, primary: false });
          }
        })
    );
  }

  @Action({ rawError })
  public async removeDashboard(dashboard: Dashboard): Promise<void> {
    this.dashboardWidgets(dashboard.id)
      .forEach(widget => this.removeWidget(widget));
    await dashboardApi.remove(dashboard).catch(() => { });
    this.commitRemoveDashboard(dashboard);
  }

  @Action({ rawError })
  public async createWidget(widget: Widget): Promise<void> {
    this.commitWidget(await widgetApi.create(widget));
  }

  @Action({ rawError })
  public async appendWidget(widget: Widget): Promise<void> {
    const order = this.dashboardWidgets(widget.dashboard).length + 1;
    this.commitWidget(await widgetApi.create({ ...widget, order }));
  }

  @Action({ rawError })
  public async saveWidget(widget: Widget): Promise<void> {
    this.commitWidget(await widgetApi.persist(widget));
  }

  @Action({ rawError })
  public async updateWidgetOrder(widgetIds: string[]): Promise<void> {
    await Promise.all(
      widgetIds
        .map(id => this.widgetById(id))
        .map((widget, idx) => this.saveWidget({ ...widget, order: idx + 1 }))
    );
  }

  @Action({ rawError })
  public async updateWidgetSize({ id, cols, rows }: Pick<Widget, 'id' | 'cols' | 'rows'>): Promise<void> {
    await this.saveWidget({ ...this.widgetById(id), cols, rows });
  }

  @Action({ rawError })
  public async updateWidgetConfig({ id, config }: Pick<Widget, 'id' | 'config'>): Promise<void> {
    await this.saveWidget({ ...this.widgetById(id), config });
  }

  @Action({ rawError })
  public async removeWidget(widget: Widget): Promise<void> {
    await widgetApi.remove(widget).catch(() => { });
    this.commitRemoveWidget(widget);
  }

  @Action({ rawError })
  public async start(): Promise<void> {
    const onDashboardChange = (dashboard: Dashboard): void => {
      const existing = this.dashboardById(dashboard.id);
      if (!existing || existing._rev !== dashboard._rev) {
        this.commitDashboard(dashboard);
      }
    };
    const onDashboardDelete = (id: string): void => {
      const existing = this.dashboardById(id);
      if (existing) {
        this.commitRemoveDashboard(existing);
      }
    };
    const onWidgetChange = (widget: Widget): void => {
      const existing = this.widgetById(widget.id);
      if (!existing || existing._rev !== widget._rev) {
        this.commitWidget(widget);
      }
    };
    const onWidgetDelete = (id: string): void => {
      const existing = this.widgetById(id);
      if (existing) {
        this.commitRemoveWidget(existing);
      }
    };

    this.commitAllDashboards(await dashboardApi.fetch());
    this.commitAllWidgets(await widgetApi.fetch());

    dashboardApi.subscribe(onDashboardChange, onDashboardDelete);
    widgetApi.subscribe(onWidgetChange, onWidgetDelete);
  }
}

export const dashboardStore = getModule(DashboardModule);
