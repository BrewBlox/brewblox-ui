import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { concatById, filterById, findById } from '@/utils/collections';
import { useFeatureStore } from '../features';
import api from './api';
import type { Widget } from './types';

export * from './types';

export const useWidgetStore = defineStore('widgetStore', () => {
  const widgets = ref<Widget[]>([]);

  const widgetIds = computed<string[]>(() => widgets.value.map((v) => v.id));

  function widgetById<T extends Widget>(id: Maybe<string>): T | null {
    return findById(widgets.value, id) as T | null;
  }

  async function createWidget(widget: Widget): Promise<void> {
    await api.create(widget); // triggers callback
  }

  async function appendWidget(widget: Widget): Promise<void> {
    const order =
      widgets.value.filter((v) => v.dashboard === widget.dashboard).length + 1;
    await createWidget({ ...widget, order });
  }

  async function saveWidget(widget: Widget): Promise<void> {
    await api.persist(widget); // triggers callback
  }

  async function removeWidget(widget: Widget): Promise<void> {
    await api.remove(widget); // triggers callback
  }

  async function start(): Promise<void> {
    const featureStore = useFeatureStore();

    const storedWidgets: Widget[] = await api.fetch();
    const upgradedWidgets: Widget[] = [];

    storedWidgets.forEach((stored) => {
      const upgraded = featureStore.upgradeWidget(stored);
      widgets.value.push(upgraded ?? stored);
      if (upgraded) {
        upgradedWidgets.push(upgraded);
      }
    });

    api.persistMult(upgradedWidgets);

    api.subscribe(
      (widget) => (widgets.value = concatById(widgets.value, widget)),
      (id) => (widgets.value = filterById(widgets.value, { id })),
    );
  }

  return {
    widgets,
    widgetIds,
    widgetById,
    createWidget,
    appendWidget,
    saveWidget,
    removeWidget,
    start,
  };
});

// interface WidgetStoreState {
//   widgets: Widget[];
// }

// export const useWidgetStore = defineStore('widgetStore', {
//   state: (): WidgetStoreState => ({
//     widgets: [],
//   }),
//   getters: {
//     widgetIds: (state): string[] => state.widgets.map((v) => v.id),
//   },
//   actions: {
//     widgetById<T extends Widget>(id: Maybe<string>): T | null {
//       return findById(widgets.value, id) as T | null;
//     },

//     async createWidget(widget: Widget): Promise<void> {
//       await api.create(widget); // triggers callback
//     },

//     async appendWidget(widget: Widget): Promise<void> {
//       const order =
//         widgets.value.filter((v) => v.dashboard === widget.dashboard).length + 1;
//       await this.createWidget({ ...widget, order });
//     },

//     async saveWidget(widget: Widget): Promise<void> {
//       await api.persist(widget); // triggers callback
//     },

//     async removeWidget(widget: Widget): Promise<void> {
//       await api.remove(widget); // triggers callback
//     },

//     async start(): Promise<void> {
//       widgets.value = await api.fetch();

//       const featureStore = useFeatureStore();
//       [...widgets.value].forEach((widget) => {
//         const upgraded = featureStore.upgradeWidget(widget);
//         if (upgraded) {
//           // Immediately set upgraded widget, to prevent rendering with invalid data
//           concatById(widgets.value, widget);
//           this.saveWidget(upgraded);
//         }
//       });

//       api.subscribe(
//         (widget) => (widgets.value = concatById(widgets.value, widget)),
//         (id) => (widgets.value = filterById(widgets.value, { id })),
//       );
//     },
//   },
// });
