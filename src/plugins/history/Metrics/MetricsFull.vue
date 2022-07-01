<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useWidget } from '@/composables';

import { MetricsConfig } from '../types';
import { MetricsWidget } from './types';

export default defineComponent({
  name: 'MetricsFull',
  setup() {
    const { widget, saveConfig } = useWidget.setup<MetricsWidget>();

    const config = computed<MetricsConfig>({
      get: () => widget.value.config,
      set: (cfg) => saveConfig(cfg),
    });

    return {
      config,
    };
  },
});
</script>

<template>
  <MetricsEditor v-model:config="config" />
</template>
