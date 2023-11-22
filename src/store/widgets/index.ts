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
      const changed = featureStore.upgradeWidget(stored);
      widgets.value.push(changed ?? stored);
      if (changed) {
        upgradedWidgets.push(changed);
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
