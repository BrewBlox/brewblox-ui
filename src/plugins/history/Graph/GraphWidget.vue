<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

@Component
export default class GraphWidget extends WidgetBase {
  settingsModalOpen: boolean = false;
  graphModalOpen: boolean = false;
  $refs!: {
    widgetGraph: any;
  }

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
    this.$nextTick(() => this.$refs.widgetGraph.resetMetrics());
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="settingsModalOpen" no-backdrop-dismiss>
      <GraphForm
        v-if="settingsModalOpen"
        v-bind="$props"
        :field="graphCfg"
        :on-change-field="saveConfig"
      />
    </q-modal>

    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widgetId }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="mdi-chart-line" @click="graphModalOpen = true"/>
      <q-btn slot="right" flat round dense icon="settings" @click="settingsModalOpen = true"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="regraph"/>
    </q-card-title>
    <q-card-separator/>
    <div class="widget-body">
      <GraphCard ref="widgetGraph" :id="$props.id" :config="graphCfg"/>
    </div>
    <q-modal v-model="graphModalOpen" maximized>
      <GraphCard v-if="graphModalOpen" :id="$props.id" :config="graphCfg" shared-metrics/>
      <div class="row graph-controls z-top">
        <q-btn v-close-overlay flat label="close"/>
      </div>
    </q-modal>
  </q-card>
</template>

<style scoped lang="stylus">
.graph-controls {
  position: absolute;
  top: 10px;
  right: 10px;
}

.q-list {
  border: 1px solid gray;
  border-right: 0px;
}

/deep/ .graph-controls .q-field * {
  align-items: center;
  margin-top: 0px !important;
}
</style>
