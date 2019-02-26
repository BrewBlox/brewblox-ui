<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

@Component
export default class GraphWidget extends WidgetBase {
  modalOpen: boolean = false;

  get graphCfg(): GraphConfig {
    return {
      layout: {},
      params: {},
      targets: [],
      renames: {},
      axes: {},
      ...this.$props.config,
    };
  }

  saveConfig(cfg: GraphConfig) {
    this.$props.onChangeConfig(this.$props.id, { ...cfg });
  }

  @Watch('graphCfg', { deep: true })
  regraph() {
    this.$nextTick(() => (this.$refs.graph as any).resetMetrics());
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen" no-backdrop-dismiss>
      <GraphForm v-if="modalOpen" v-bind="$props" :field="graphCfg" :on-change-field="saveConfig"/>
    </q-modal>
    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widgetId }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="settings" @click="modalOpen = true"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="regraph"/>
    </q-card-title>
    <q-card-separator/>
    <div class="widget-body">
      <GraphCard ref="graph" :id="$props.id" :config="graphCfg"/>
    </div>
  </q-card>
</template>
