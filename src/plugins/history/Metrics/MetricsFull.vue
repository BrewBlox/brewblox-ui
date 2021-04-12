<script lang="ts">
import defaults from 'lodash/defaults';
import { computed, defineComponent } from 'vue';

import { useCrud } from '@/composables';

import { MetricsConfig } from './types';
import { emptyMetricsConfig } from './utils';

export default defineComponent({
  name: 'MetricsFull',
  props: {
    ...useCrud.props,
  },
  setup(props) {
    const {
      crud,
      saveConfig,
    } = useCrud.setup<MetricsConfig>(props.crud);

    const config = computed<MetricsConfig>(
      () => defaults(crud.widget.config, emptyMetricsConfig()),
    );

    return {
      config,
      saveConfig,
    };
  },
});


</script>

<template>
  <MetricsEditor :config="config" class="widget-md" @update:config="saveConfig" />
</template>
