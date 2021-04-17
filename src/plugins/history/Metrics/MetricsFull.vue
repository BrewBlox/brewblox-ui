<script lang="ts">
import defaults from 'lodash/defaults';
import { computed, defineComponent } from 'vue';

import { useWidget } from '@/composables';

import { MetricsConfig } from './types';
import { emptyMetricsConfig } from './utils';

export default defineComponent({
  name: 'MetricsFull',
  props: {
    ...useWidget.props,
  },
  setup(props) {
    const {
      widget,
      saveConfig,
    } = useWidget.setup<MetricsConfig>(props.widgetId);

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
  <MetricsEditor :v-model:config="config" class="widget-md" />
</template>
