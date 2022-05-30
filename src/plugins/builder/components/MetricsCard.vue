<script lang="ts">
import defaults from 'lodash/defaults';
import { PropType, computed, defineComponent } from 'vue';

import { MetricsConfig } from '@/plugins/history/types';
import { emptyMetricsConfig } from '@/plugins/history/utils';

import { FlowPart } from '../types';

export default defineComponent({
  name: 'MetricsCard',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  emits: ['update:part'],
  setup(props, { emit }) {
    const config = computed<MetricsConfig>(() => {
      return defaults(props.part.metrics, emptyMetricsConfig());
    });
    function saveConfig(metrics: MetricsConfig): void {
      const updated: FlowPart = {
        ...props.part,
        metrics,
      };
      emit('update:part', updated);
    }
    return { config, saveConfig };
  },
});
</script>

<template>
  <q-item class="q-ma-none q-mt-xs">
    <q-item-section>
      <q-item-label caption> Metrics </q-item-label>
      <MetricsEditor
        :config="config"
        @update:config="saveConfig"
      />
    </q-item-section>
  </q-item>
</template>
