<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { GraphConfig } from '@/components/Graph/state';
import { Watch } from 'vue-property-decorator';

@Component
export default class GraphWidget extends WidgetBase {
  get graphCfg(): GraphConfig {
    return this.$props.config;
  }

  set graphCfg(cfg: GraphConfig) {
    this.$props.onConfigChange(this.$props.id, { ...cfg });
  }

  @Watch('graphCfg', { deep: true })
  regraph() {
    this.$nextTick(() => (this.$refs.graph as any).resetMetrics());
  }
}
</script>

<template>
  <widget-card
    :title="$props.id"
    :subTitle="$props.type"
    :onRefresh="regraph"
    :body="false"
    form="GraphForm"
    v-model="graphCfg"
  >
    <GraphCard
      ref="graph"
      :id="$props.id"
      :config="graphCfg"
    />
  </widget-card>
</template>

<style scoped>
</style>
