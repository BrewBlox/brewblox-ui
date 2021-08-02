<script lang="ts">
import { Layout } from 'plotly.js';
import { defineComponent, nextTick, ref } from 'vue';

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

    const sourceRevision = ref<Date>(new Date());
    const renderRevision = ref<Date>(new Date());

    async function refresh(): Promise<void> {
      await nextTick();
      renderRevision.value = new Date();
    }

    async function regraph(): Promise<void> {
      await nextTick();
      sourceRevision.value = new Date();
    }

    function saveGraphParams(params: QueryParams): void {
      if (graphConfig.value) {
        graphConfig.value = { ...graphConfig.value, params };
        regraph();
      }
    }

    function saveGraphLayout(layout: Partial<Layout>): void {
      if (graphConfig.value) {
        graphConfig.value = { ...graphConfig.value, layout };
        refresh();
      }
    }

    return {
      context,
      widgetId,
      graphConfig,
      sourceRevision,
      renderRevision,
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
    :source-revision="sourceRevision"
    :render-revision="renderRevision"
    use-presets
    use-range
    @params="saveGraphParams"
    @layout="saveGraphLayout"
  />
</template>
