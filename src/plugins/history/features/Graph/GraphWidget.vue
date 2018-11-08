<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { GraphConfig } from '@/plugins/history/components/Graph/state';

@Component
export default class GraphWidget extends WidgetBase {
  get graphCfg(): GraphConfig {
    return this.$props.config;
  }

  set graphCfg(cfg: GraphConfig) {
    this.$props.onConfigChange(this.$props.id, { ...cfg });
  }
}
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="() => {}"
    :body="false"
    form="GraphForm"
    v-model="graphCfg"
  >
    <GraphCard
      :id="$props.id"
      :config="graphCfg"
    />
  </widget-card>
</template>

<style scoped>
</style>
