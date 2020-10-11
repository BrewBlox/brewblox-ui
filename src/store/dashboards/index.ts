import { Action, Module, VuexModule } from 'vuex-class-modules';

import { extendById, filterById, findById } from '@/helpers/functional';
import store from '@/store';

import { dashboardApi, widgetApi } from './api';
import { Dashboard, Widget } from './types';

export * from './types';

@Module({ generateMutationSetters: true })
export class DashboardModule extends VuexModule {
  public dashboards: Dashboard[] = [];
  public widgets: Widget[] = [];

  public get dashboardIds(): string[] {
    return this.dashboards.map(v => v.id);
  }

  public get widgetIds(): string[] {
    return this.widgets.map(v => v.id);
  }

  public get primaryDashboardId(): string | null {
    const sorted = [...this.dashboards]
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

  public dashboardById(id: string): Dashboard | null {
    return findById(this.dashboards, id);
  }

  public dashboardTitle(id: string): string {
    return this.dashboardById(id)?.title ?? 'Unknown';
  }

  public widgetById(id: string): Widget | null {
    return findById(this.widgets, id);
  }

  public dashboardWidgets(dashboardId: string): Widget[] {
    return this.widgets.filter(widget => widget.dashboard === dashboardId);
  }

  @Action
  public async createDashboard(dashboard: Dashboard): Promise<void> {
    await dashboardApi.create(dashboard); // triggers callback
  }

  @Action
  public async saveDashboard(dashboard: Dashboard): Promise<void> {
    await dashboardApi.persist(dashboard);// triggers callback
  }

  @Action
  public async updateDashboardOrder(ids: string[]): Promise<void> {
    await Promise.all(
      ids
        .map(id => this.dashboardById(id))
        .filter(v => v !== null)
        .map((dashboard, idx) => this.saveDashboard({ ...dashboard!, order: idx + 1 }))
    );
  }

  @Action
  public async updatePrimaryDashboard(newId: string | null): Promise<void> {
    await Promise.all(
      this.dashboards
        .map((dash: Dashboard) => {
          if (dash.id === newId && !dash.primary) {
            return this.saveDashboard({ ...dash, primary: true });
          } else if (dash.primary) {
            return this.saveDashboard({ ...dash, primary: false });
          }
        })
    );
  }

  @Action
  public async removeDashboard(dashboard: Dashboard): Promise<void> {
    this.dashboardWidgets(dashboard.id)
      .forEach(widget => this.removeWidget(widget));
    await dashboardApi.remove(dashboard); // triggers callback
  }

  @Action
  public async createWidget(widget: Widget): Promise<void> {
    await widgetApi.create(widget); // triggers callback
  }

  @Action
  public async appendWidget(widget: Widget): Promise<void> {
    const order = this.dashboardWidgets(widget.dashboard).length + 1;
    await this.createWidget({ ...widget, order });
  }

  @Action
  public async saveWidget(widget: Widget): Promise<void> {
    await widgetApi.persist(widget); // triggers callback
  }

  @Action
  public async updateWidgetOrder(widgetIds: string[]): Promise<void> {
    await Promise.all(
      widgetIds
        .map(id => this.widgetById(id))
        .filter(v => v !== null)
        .map((widget, idx) => this.saveWidget({ ...widget!, order: idx + 1 }))
    );
  }

  @Action
  public async updateWidgetSize({ id, cols, rows }: Pick<Widget, 'id' | 'cols' | 'rows'>): Promise<void> {
    const widget = this.widgetById(id);
    if (widget) {
      await this.saveWidget({ ...widget, cols, rows });
    }
  }

  @Action
  public async updateWidgetConfig({ id, config }: Pick<Widget, 'id' | 'config'>): Promise<void> {
    const widget = this.widgetById(id);
    if (widget) {
      await this.saveWidget({ ...widget, config });
    }
  }

  @Action
  public async removeWidget(widget: Widget): Promise<void> {
    await widgetApi.remove(widget); // triggers callback
  }

  @Action
  public async start(): Promise<void> {
    const onDashboardChange = (dashboard: Dashboard): void => {
      const existing = this.dashboardById(dashboard.id);
      if (!existing || existing._rev !== dashboard._rev) {
        this.dashboards = extendById(this.dashboards, dashboard);
      }
    };
    const onDashboardDelete = (id: string): void => {
      this.dashboards = filterById(this.dashboards, { id });
    };

    const onWidgetChange = (widget: Widget): void => {
      const existing = this.widgetById(widget.id);
      if (!existing || existing._rev !== widget._rev) {
        this.widgets = extendById(this.widgets, widget);
      }
    };
    const onWidgetDelete = (id: string): void => {
      this.widgets = filterById(this.widgets, { id });
    };

    this.dashboards = await dashboardApi.fetch();
    this.widgets = await widgetApi.fetch();

    dashboardApi.subscribe(onDashboardChange, onDashboardDelete);
    widgetApi.subscribe(onWidgetChange, onWidgetDelete);
  }
}

export const dashboardStore = new DashboardModule({ store, name: 'dashboards' });
