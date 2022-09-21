import type { Widget } from '@/store/widgets/types';
import { findById } from '@/utils/collections';
import isString from 'lodash/isString';
import { defineStore } from 'pinia';
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

interface FeatureStoreState {
  widgets: WidgetFeature[];
  quickStarts: QuickstartFeature[];
  watchers: WatcherFeature[];
  services: ServiceFeature[];
}

export const useFeatureStore = defineStore('featureStore', {
  state: (): FeatureStoreState => ({
    widgets: [],
    quickStarts: [],
    watchers: [],
    services: [],
  }),
  getters: {
    widgetIds: (state): string[] => state.widgets.map((v) => v.id),
    quickStartIds: (state): string[] => state.quickStarts.map((v) => v.id),
    watcherIds: (state): string[] => state.watchers.map((v) => v.id),
    serviceIds: (state): string[] => state.services.map((v) => v.id),
  },
  actions: {
    widgetById(id: Maybe<string>): WidgetFeature | null {
      return findById(this.widgets, id);
    },
    quickStartById(id: Maybe<string>): QuickstartFeature | null {
      return findById(this.quickStarts, id);
    },
    watcherById(id: Maybe<string>): WatcherFeature | null {
      return findById(this.watchers, id);
    },
    serviceById(id: Maybe<string>): ServiceFeature | null {
      return findById(this.services, id);
    },
    widgetTitle(id: Maybe<string>): string {
      return this.widgetById(id)?.title ?? 'Unknown';
    },
    widgetRole(id: Maybe<string>): WidgetRole {
      return this.widgetById(id)?.role ?? 'Other';
    },
    widgetWizard(id: string): string | null {
      const feature = this.widgetById(id);
      if (feature === null) {
        return null;
      }
      if (isString(feature.wizard)) {
        return feature.wizard;
      }
      if (feature.wizard === true) {
        return 'GenericWidgetWizard';
      }
      return null;
    },
    widgetComponent(widget: Widget): ComponentResult {
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
    },
    widgetSize(id: string): GridSize {
      return this.widgetById(id)?.widgetSize ?? { cols: 3, rows: 2 };
    },
    widgetRemoveActions(id: string): WidgetRemoveAction[] {
      return this.widgetById(id)?.removeActions ?? [];
    },
    upgradeWidget(widget: Widget): Widget | null {
      const func = this.widgetById(widget.feature)?.upgrade;
      return func ? func(widget) : null;
    },
    addWidgetFeature(feature: WidgetFeature): void {
      if (feature.wizard === true && feature.generateConfig === undefined) {
        throw new Error(
          `Widget feature ${feature.id} ` +
            'must define a generateConfig function to use the default wizard',
        );
      }
      if (this.widgetById(feature.id)) {
        throw new Error(`Widget feature '${feature.id}' already exists`);
      }
      this.widgets = [...this.widgets, feature];
    },
    addQuickstartFeature(feature: QuickstartFeature): void {
      if (this.quickStartById(feature.id)) {
        throw new Error(`Widget feature '${feature.id}' already exists`);
      }
      this.quickStarts = [...this.quickStarts, feature];
    },
    addWatcherFeature(feature: WatcherFeature): void {
      if (this.watcherById(feature.id)) {
        throw new Error(`Watcher feature '${feature.id}' already exists`);
      }
      this.watchers = [...this.watchers, feature];
    },
    addServiceFeature(feature: ServiceFeature): void {
      if (this.serviceById(feature.id)) {
        throw new Error(`Service feature '${feature.id}' already exists`);
      }
      this.services = [...this.services, feature];
    },
  },
});
