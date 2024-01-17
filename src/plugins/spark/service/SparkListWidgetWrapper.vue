<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFeatureStore, WidgetContext } from '@/store/features';
import { BlockWidget } from '../types';
import { ListRenderAddress } from './types';

interface Props {
  address: ListRenderAddress;
}

const props = defineProps<Props>();

const context: WidgetContext = {
  mode: 'Basic',
  container: 'Dashboard',
  size: 'Content',
};

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
</script>

<template>
  <WidgetWrapper
    v-if="widget"
    v-model:widget="widget"
    :context="context"
    volatile
  />
</template>
