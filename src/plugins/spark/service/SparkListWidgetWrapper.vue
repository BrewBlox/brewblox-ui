<script lang="ts">
import { computed, defineComponent, PropType, watch } from 'vue';

import {
  ComponentResult,
  useFeatureStore,
  WidgetContext,
} from '@/store/features';
import { useWidgetStore, Widget } from '@/store/widgets';

import { BlockConfig } from '../types';
import { ListRenderAddress } from './types';

const context: WidgetContext = {
  mode: 'Basic',
  container: 'Dashboard',
  size: 'Content',
};

export default defineComponent({
  name: 'SparkListWidgetWrapper',
  props: {
    address: {
      type: Object as PropType<ListRenderAddress>,
      required: true,
    },
  },
  setup(props) {
    const featureStore = useFeatureStore();
    const widgetStore = useWidgetStore();

    const widgetId = computed<string>(() => {
      const { serviceId, id, type } = props.address;
      return [serviceId, id, type].join('/');
    });

    const widget = computed<Widget<BlockConfig> | null>(() =>
      widgetStore.widgetById(widgetId.value),
    );

    const widgetComponent = computed<ComponentResult | null>(() =>
      widget.value ? featureStore.widgetComponent(widget.value) : null,
    );

    watch(
      () => widget.value,
      (newV) => {
        if (!newV) {
          const widget: Widget<BlockConfig> = {
            id: widgetId.value,
            title: props.address.name,
            feature: props.address.type,
            dashboard: '',
            order: 0,
            config: {
              serviceId: props.address.serviceId,
              blockId: props.address.id,
            },
            ...featureStore.widgetSize(props.address.type),
          };
          widgetStore.setVolatileWidget(widget);
        }
      },
      { immediate: true },
    );

    return {
      context,
      widgetId,
      widgetComponent,
    };
  },
});
</script>

<template>
  <WidgetProvider :widget-id="widgetId" :context="context">
    <component
      :is="widgetComponent.component"
      v-if="widgetComponent"
      :error="widgetComponent.error"
    />
  </WidgetProvider>
</template>
