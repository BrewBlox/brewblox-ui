<script setup lang="ts">
import { QueryParams } from '@/plugins/history/types';
import { useBlockWidget } from '@/plugins/spark/composables';
import { Layout } from 'plotly.js';
import { nextTick, ref } from 'vue';

const { widgetId, graphConfig } = useBlockWidget.setup();

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
</script>

<template>
  <HistoryGraph
    :graph-id="widgetId"
    :config="graphConfig"
    v-bind="{
      sourceRevision,
      renderRevision,
    }"
    control-presets
    control-range
    class="fit"
    @params="saveGraphParams"
    @layout="saveGraphLayout"
  />
</template>
