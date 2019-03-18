<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import { defaultPresets } from '@/components/Graph/getters';
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { QueryParams } from '@/store/history/state';

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

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  saveConfig(cfg: GraphConfig) {
    this.$props.onChangeConfig(this.$props.id, { ...cfg });
  }

  applyPreset(preset: QueryParams) {
    this.saveConfig({
      ...this.graphCfg,
      params: { ...preset },
    });
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
      <q-btn slot="right" flat round dense icon="mdi-timelapse">
        <q-popover>
          <q-list link>
            <q-item
              v-close-overlay
              v-for="(preset, idx) in presets"
              :key="idx"
              @click.native="() => applyPreset(preset)"
            >{{ preset.duration }}</q-item>
          </q-list>
        </q-popover>
      </q-btn>
      <q-btn slot="right" flat round dense icon="mdi-chart-line" @click="graphModalOpen = true"/>
      <q-btn slot="right" flat round dense icon="settings" @click="settingsModalOpen = true"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="regraph"/>
    </q-card-title>
    <q-card-separator/>
    <div class="widget-body">
      <GraphCard ref="widgetGraph" :id="$props.id" :config="graphCfg"/>
    </div>
    <q-modal v-model="graphModalOpen" maximized>
      <GraphCard v-if="graphModalOpen" :id="$props.id" :config="graphCfg" shared-metrics>
        <q-btn-dropdown flat label="presets" icon="mdi-timelapse">
          <q-list link>
            <q-item
              v-for="(preset, idx) in presets"
              :key="idx"
              @click.native="() => applyPreset(preset)"
            >{{ preset.duration }}</q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn v-close-overlay flat label="close"/>
      </GraphCard>
    </q-modal>
  </q-card>
</template>

<style scoped lang="stylus">
.q-list {
  border: 1px solid gray;
  border-right: 0px;
}
</style>
