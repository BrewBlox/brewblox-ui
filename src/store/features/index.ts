import isString from 'lodash/isString';
import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import store from '@/store';

import {
  Crud,
  QuickStartFeature,
  ServiceFeature,
  WatcherFeature,
  WidgetFeature,
  WidgetRemoveAction,
  WidgetRole,
} from './types';

export * from './types';

const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'features' })
export class FeatureModule extends VuexModule {

  public widgets: Mapped<WidgetFeature> = {};
  public quickStarts: Mapped<QuickStartFeature> = {};
  public watchers: Mapped<WatcherFeature> = {};
  public services: Mapped<ServiceFeature> = {};

  public get widgetIds(): string[] {
    return Object.keys(this.widgets);
  }

  public get widgetValues(): WidgetFeature[] {
    return Object.values(this.widgets);
  }

  public get quickStartIds(): string[] {
    return Object.keys(this.quickStarts);
  }

  public get quickStartValues(): QuickStartFeature[] {
    return Object.values(this.quickStarts);
  }

  public get watcherIds(): string[] {
    return Object.keys(this.watchers);
  }

  public get watcherValues(): WatcherFeature[] {
    return Object.values(this.watchers);
  }

  public get serviceIds(): string[] {
    return Object.keys(this.services);
  }

  public get serviceValues(): ServiceFeature[] {
    return Object.values(this.services);
  }

  public get widgetTitle(): (id: string) => string {
    return id => this.widgets[id]?.title ?? 'Unknown';
  }

  public get widgetRole(): (id: string) => WidgetRole {
    return id => this.widgets[id]?.role ?? 'Other';
  }

  public get widgetWizard(): (id: string) => string | null {
    return (id: string): string | null => {
      const feature = this.widgets[id];
      if (feature === undefined) { return null; };
      return isString(feature.wizard)
        ? feature.wizard
        : !!feature.wizard
          ? 'GenericWidgetWizard'
          : null;
    };
  }

  public get widgetComponent(): (crud: Crud, throwInvalid?: boolean) => string {
    return (crud: Crud, throwInvalid = false) => {
      try {
        const feature = this.widgets[crud.widget.feature];
        if (!feature) {
          throw new Error(`No feature found for '${crud.widget.feature}'`);
        }
        return isString(feature.component)
          ? feature.component
          : feature.component(crud);
      } catch (e) {
        if (throwInvalid) { throw e; }
        return 'InvalidWidget';
      }
    };
  }

  public get widgetSize(): (id: string) => GridSize {
    return id => this.widgets[id]?.widgetSize;
  }

  public get widgetRemoveActions(): (id: string) => WidgetRemoveAction[] {
    return id => this.widgets[id]?.removeActions ?? [];
  }

  @Mutation
  public commitWidgetFeature(feature: WidgetFeature): void {
    Vue.set(this.widgets, feature.id, feature);
  }

  @Mutation
  public commitQuickStartFeature(feature: QuickStartFeature): void {
    Vue.set(this.quickStarts, feature.id, feature);
  }

  @Mutation
  public commitWatcherFeature(feature: WatcherFeature): void {
    Vue.set(this.watchers, feature.id, feature);
  }

  @Mutation
  public commitServiceFeature(feature: ServiceFeature): void {
    Vue.set(this.services, feature.id, feature);
  }

  @Action({ rawError })
  public async registerWidget(feature: WidgetFeature): Promise<void> {
    if (feature.wizard === true && feature.generateConfig === undefined) {
      throw new Error(`Feature ${feature.id} must define a generateConfig function to use the default wizard`);
    }
    this.commitWidgetFeature(feature);
  }

  @Action({ rawError })
  public async registerQuickStart(feature: QuickStartFeature): Promise<void> {
    this.commitQuickStartFeature(feature);
  }

  @Action({ rawError })
  public async registerWatcher(feature: WatcherFeature): Promise<void> {
    this.commitWatcherFeature(feature);
  }

  @Action({ rawError })
  public async registerService(feature: ServiceFeature): Promise<void> {
    this.commitServiceFeature(feature);
  }
}

export const featureStore = getModule(FeatureModule);
