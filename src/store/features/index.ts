import isString from 'lodash/isString';
import { Module, Mutation, VuexModule } from 'vuex-class-modules';

import store from '@/store';
import type { Widget } from '@/store/widgets';
import { findById } from '@/utils';

import type {
  ComponentResult,
  QuickstartFeature,
  ServiceFeature,
  WatcherFeature,
  WidgetFeature,
  WidgetRemoveAction,
  WidgetRole,
} from './types';

export * from './types';

@Module({ generateMutationSetters: true })
export class FeatureModule extends VuexModule {

  public widgets: WidgetFeature[] = [];
  public quickStarts: QuickstartFeature[] = [];
  public watchers: WatcherFeature[] = [];
  public services: ServiceFeature[] = [];

  public get widgetIds(): string[] {
    return this.widgets.map(v => v.id);
  }

  public get quickStartIds(): string[] {
    return this.quickStarts.map(v => v.id);
  }

  public get watcherIds(): string[] {
    return this.watchers.map(v => v.id);
  }

  public get serviceIds(): string[] {
    return this.services.map(v => v.id);
  }

  public widgetById(id: Maybe<string>): WidgetFeature | null {
    return findById(this.widgets, id);
  }

  public quickStartById(id: Maybe<string>): QuickstartFeature | null {
    return findById(this.quickStarts, id);
  }

  public watcherById(id: Maybe<string>): WatcherFeature | null {
    return findById(this.watchers, id);
  }

  public serviceById(id: Maybe<string>): ServiceFeature | null {
    return findById(this.services, id);
  }

  public widgetTitle(id: Maybe<string>): string {
    return this.widgetById(id)?.title ?? 'Unknown';
  }

  public widgetRole(id: Maybe<string>): WidgetRole {
    return this.widgetById(id)?.role ?? 'Other';
  }

  public widgetWizard(id: string): string | null {
    const feature = this.widgetById(id);
    if (feature === null) { return null; }
    if (isString(feature.wizard)) { return feature.wizard; }
    if (feature.wizard === true) { return 'GenericWidgetWizard'; }
    return null;
  }

  public widgetComponent(widget: Widget): ComponentResult {
    const feature = this.widgetById(widget.feature);
    if (!feature) {
      return {
        component: 'InvalidWidget',
        error: `No feature found for '${widget.feature}'`,
      };
    }
    return isString(feature.component)
      ? { component: feature.component }
      : feature.component(widget);
  }

  public widgetSize(id: string): GridSize {
    return this.widgetById(id)?.widgetSize ?? { cols: 3, rows: 2 };
  }

  public widgetRemoveActions(id: string): WidgetRemoveAction[] {
    return this.widgetById(id)?.removeActions ?? [];
  }

  @Mutation
  public addWidgetFeature(feature: WidgetFeature): void {
    if (feature.wizard === true && feature.generateConfig === undefined) {
      throw new Error(`Widget feature ${feature.id} must define a generateConfig function to use the default wizard`);
    }
    if (this.widgetById(feature.id)) {
      throw new Error(`Widget feature '${feature.id}' already exists`);
    }
    this.widgets = [...this.widgets, feature];
  }

  @Mutation
  public addQuickstartFeature(feature: QuickstartFeature): void {
    if (this.quickStartById(feature.id)) {
      throw new Error(`Widget feature '${feature.id}' already exists`);
    }
    this.quickStarts = [...this.quickStarts, feature];
  }

  @Mutation
  public addWatcherFeature(feature: WatcherFeature): void {
    if (this.watcherById(feature.id)) {
      throw new Error(`Watcher feature '${feature.id}' already exists`);
    }
    this.watchers = [...this.watchers, feature];
  }

  @Mutation
  public addServiceFeature(feature: ServiceFeature): void {
    if (this.serviceById(feature.id)) {
      throw new Error(`Service feature '${feature.id}' already exists`);
    }
    this.services = [...this.services, feature];
  }
}

export const featureStore = new FeatureModule({ store, name: 'features' });
