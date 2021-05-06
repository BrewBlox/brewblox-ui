<script lang="ts">
import { Layout } from 'plotly.js';
import { defineComponent } from 'vue';

import { useContext } from '@/composables';
import { QueryParams } from '@/plugins/history/types';
import { useBlockWidget } from '@/plugins/spark/composables';

export default defineComponent({
  name: 'BlockHistoryGraph',
  setup() {
    const {
      context,
    } = useContext.setup();
    const {
      widgetId,
      graphConfig,
    } = useBlockWidget.setup();

    function saveGraphParams(params: QueryParams): void {
      if (graphConfig.value) {
        graphConfig.value = { ...graphConfig.value, params };
      }
    }

    function saveGraphLayout(layout: Partial<Layout>): void {
      if (graphConfig.value) {
        graphConfig.value = { ...graphConfig.value, layout };
      }
    }

    return {
      context,
      widgetId,
      graphConfig,
      saveGraphParams,
      saveGraphLayout,
    };
  },
});
</script>

<template>
  <HistoryGraph
    :graph-id="widgetId"
    :config="graphConfig"
    :refresh-trigger="context.mode"
    use-presets
    use-range
    @params="saveGraphParams"
    @layout="saveGraphLayout"
  />
</template>
