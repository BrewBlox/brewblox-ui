// Mounts a block widget as BlockWidgetWrapper would,
// with the block and the other blocks of its service in the Spark store.

import { mount, VueWrapper } from '@vue/test-utils';
import { Block } from 'brewblox-proto/ts';
import { createPinia, setActivePinia } from 'pinia';
import { Component, computed, defineComponent, h, reactive } from 'vue';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockKey } from '@/plugins/spark/symbols';
import { WidgetMode } from '@/store/features';
import {
  ChangeWidgetTitleKey,
  ContextKey,
  InvalidateKey,
  PatchWidgetKey,
  VolatileKey,
  WidgetKey,
} from '@/symbols';

/** A stub that shows a slot other than the default one */
export const slotStub = (slot: string): Component =>
  defineComponent({
    setup(_, { slots }) {
      return () => h('div', slots[slot]?.());
    },
  });

export interface MountBlockWidgetOptions {
  /** The other blocks of the service */
  others?: Block[];
  mode?: WidgetMode;
  components?: Record<string, Component>;
  stubs?: Record<string, Component | boolean>;
}

export function mountBlockWidget(
  widgetComponent: Component,
  block: Block,
  { others = [], mode = 'Full', components, stubs }: MountBlockWidgetOptions,
): VueWrapper {
  setActivePinia(createPinia());
  const sparkStore = useSparkStore();
  sparkStore.$patch((state) => {
    state.serviceIds = [block.serviceId];
    state.blocks = { [block.serviceId]: [block, ...others] };
  });
  const widget = {
    id: 'widget',
    title: block.id,
    feature: block.type,
    dashboard: 'dashboard',
    order: 0,
    cols: 4,
    rows: 4,
    config: { serviceId: block.serviceId, blockId: block.id },
  };
  return mount(widgetComponent, {
    global: {
      components,
      stubs,
      renderStubDefaultSlot: true,
      provide: {
        [WidgetKey as symbol]: computed(() => widget),
        [PatchWidgetKey as symbol]: () => {},
        [InvalidateKey as symbol]: () => {},
        [VolatileKey as symbol]: false,
        [ChangeWidgetTitleKey as symbol]: () => {},
        [ContextKey as symbol]: reactive({
          container: 'Dashboard',
          mode,
          size: 'Fixed',
        }),
        [BlockKey as symbol]: computed(() =>
          sparkStore.blockById(block.serviceId, block.id),
        ),
      },
    },
  });
}
