<script lang="ts">
import defaults from 'lodash/defaults';
import { computed, defineComponent } from 'vue';

import { useWidget } from '@/composables';

import { MetricsConfig, MetricsWidget } from './types';
import { emptyMetricsConfig } from './utils';

export default defineComponent({
  name: 'MetricsFull',
  setup() {
    const {
      widget,
      saveConfig,
    } = useWidget.setup<MetricsWidget>();

    const config = computed<MetricsConfig>({
      get: () => defaults(widget.value.config, emptyMetricsConfig()),
      set: cfg => saveConfig(cfg),
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
