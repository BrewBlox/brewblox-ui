<script lang="ts">
import { useFeatureStore, WidgetContext } from '@/store/features';
import { computed, defineComponent, PropType, ref } from 'vue';
import { BlockWidget } from '../types';
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

    const widgetId = computed<string>(() => {
      const { serviceId, id, type } = props.address;
      return [serviceId, id, type].join('/');
    });

    const widget = ref<BlockWidget>({
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
    });

    const widgetComponent = computed<string | null>(() =>
      widget.value ? featureStore.widgetComponent(widget.value) : null,
    );

    return {
      context,
      widget,
      widgetId,
      widgetComponent,
    };
  },
});
</script>

<template>
  <WidgetWrapper
    v-if="widget"
    v-model:widget="widget"
    :context="context"
    volatile
  />
</template>
