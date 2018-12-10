<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

@Component
export default class GraphWidget extends WidgetBase {
  modalOpen: boolean = false;

  get graphCfg(): GraphConfig {
    return this.$props.config;
  }

  saveConfig(cfg: GraphConfig) {
    this.$props.onConfigChange(this.$props.id, { ...cfg });
  }

  @Watch('graphCfg', { deep: true })
  regraph() {
    this.$nextTick(() => (this.$refs.graph as any).resetMetrics());
  }
}
</script>

<template>
  <div>
    <q-modal v-model="modalOpen">
      <GraphForm v-if="modalOpen" :field="graphCfg" :change="saveConfig"/>
    </q-modal>
    <q-card dark class="column">
      <q-card-title class="title-bar">
        <InputPopupEdit
          :field="widgetId"
          label="Widget ID"
          display="span"
          :change="v => widgetId = v"
        />
        <span class="vertical-middle on-left" slot="right">{{ displayName }}</span>
        <q-btn flat round dense slot="right" @click="modalOpen = true" icon="settings"/>
        <q-btn flat round dense slot="right" @click="regraph" icon="refresh"/>
      </q-card-title>
      <q-card-separator/>
      <div>
        <GraphCard ref="graph" :id="$props.id" :config="graphCfg"/>
      </div>
    </q-card>
  </div>
</template>

<style scoped>
</style>
