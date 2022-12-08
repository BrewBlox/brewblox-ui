<script lang="ts">
import { MetricsConfig } from '@/plugins/history/types';
import { emptyMetricsConfig } from '@/plugins/history/utils';
import defaults from 'lodash/defaults';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'MetricsCard',
  setup() {
    const { part } = usePart.setup();

    const config = computed<MetricsConfig>({
      get: () => defaults(part.value.metrics, emptyMetricsConfig()),
      set: (metrics) => {
        part.value = { ...part.value, metrics };
      },
    });

    return {
      config,
    };
  },
});
</script>

<template>
  <q-item class="q-ma-none q-mt-xs">
    <q-item-section>
      <q-item-label caption> Metrics </q-item-label>
      <MetricsEditor v-model:config="config" />
    </q-item-section>
  </q-item>
</template>
