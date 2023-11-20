import { defineStore } from 'pinia';
import { computed, shallowRef } from 'vue';
import type { Widget } from '@/store/widgets/types';
import { findById } from '@/utils/collections';
import type {
  GridSize,
  QuickstartFeature,
  ServiceFeature,
  WatcherFeature,
  WidgetFeature,
  WidgetRemoveAction,
  WidgetRole,
} from './types';

export * from './types';

export const useFeatureStore = defineStore('featureStore', () => {
  const widgets = shallowRef<WidgetFeature[]>([]);
  const quickStarts = shallowRef<QuickstartFeature[]>([]);
  const watchers = shallowRef<WatcherFeature[]>([]);
  const services = shallowRef<ServiceFeature[]>([]);

  const widgetIds = computed<string[]>(() => widgets.value.map((v) => v.id));
  const quickStartIds = computed<string[]>(() =>
    quickStarts.value.map((v) => v.id),
  );
  const watcherIds = computed<string[]>(() => watchers.value.map((v) => v.id));
  const serviceIds = computed<string[]>(() => services.value.map((v) => v.id));

  function widgetById(id: Maybe<string>): WidgetFeature | null {
    return findById(widgets.value, id);
  }

  function quickStartById(id: Maybe<string>): QuickstartFeature | null {
    return findById(quickStarts.value, id);
  }

  function watcherById(id: Maybe<string>): WatcherFeature | null {
    return findById(watchers.value, id);
  }

  function serviceById(id: Maybe<string>): ServiceFeature | null {
    return findById(services.value, id);
  }

  function widgetTitle(id: Maybe<string>): string {
    return widgetById(id)?.title ?? 'Unknown';
  }

  function widgetRole(id: Maybe<string>): WidgetRole {
    return widgetById(id)?.role ?? 'Other';
  }

  function widgetComponent(widget: Maybe<Widget>): string | null {
    return widgetById(widget?.feature)?.component ?? null;
  }

  function widgetSize(id: string): GridSize {
    return widgetById(id)?.widgetSize ?? { cols: 3, rows: 2 };
  }

  function widgetRemoveActions(id: string): WidgetRemoveAction[] {
    return widgetById(id)?.removeActions ?? [];
  }

  function upgradeWidget(widget: Widget): Widget | null {
    const func = widgetById(widget.feature)?.upgrade;
    return func ? func(widget) : null;
  }

  function addWidgetFeature<T>(feature: WidgetFeature<T>): void {
    if (feature.creatable !== false && feature.generateConfig === undefined) {
      throw new Error(
        `Widget feature ${feature.id} ` +
          'must define a generateConfig function to be creatable',
      );
    }
    if (widgetById(feature.id)) {
      throw new Error(`Widget feature '${feature.id}' already exists`);
    }
    widgets.value.push(feature);
  }

  function addQuickstartFeature(feature: QuickstartFeature): void {
    if (quickStartById(feature.id)) {
      throw new Error(`Widget feature '${feature.id}' already exists`);
    }
    quickStarts.value.push(feature);
  }

  function addWatcherFeature(feature: WatcherFeature): void {
    if (watcherById(feature.id)) {
      throw new Error(`Watcher feature '${feature.id}' already exists`);
    }
    watchers.value.push(feature);
  }

  function addServiceFeature(feature: ServiceFeature): void {
    if (serviceById(feature.id)) {
      throw new Error(`Service feature '${feature.id}' already exists`);
    }
    services.value.push(feature);
  }

  return {
    widgets,
    quickStarts,
    watchers,
    services,

    widgetIds,
    quickStartIds,
    watcherIds,
    serviceIds,

    widgetById,
    quickStartById,
    watcherById,
    serviceById,
    widgetTitle,
    widgetRole,
    widgetComponent,
    widgetSize,
    widgetRemoveActions,
    upgradeWidget,
    addWidgetFeature,
    addQuickstartFeature,
    addWatcherFeature,
    addServiceFeature,
  };
});
