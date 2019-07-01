<script lang="ts">
import { Component } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { defaultPresets } from '@/components/Graph/getters';
import { GraphConfig } from '@/components/Graph/types';
import WidgetBase from '@/components/Widget/WidgetBase';
import { QueryParams } from '@/store/history';

@Component
export default class GraphWidget extends WidgetBase {
  $refs!: {
    widgetGraph: any;
  }
  settingsModalOpen: boolean = false;
  graphModalOpen: boolean = false;
  downsampling: any = {};

  get graphCfg(): GraphConfig {
    return {
      layout: {},
      params: {},
      targets: [],
      renames: {},
      axes: {},
      ...this.widget.config,
    };
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  isActivePreset(preset: QueryParams) {
    return JSON.stringify(preset) === JSON.stringify(this.graphCfg.params);
  }

  applyPreset(preset: QueryParams) {
    this.saveConfig({
      ...this.graphCfg,
      params: { ...preset },
    });
  }

  @Watch('graphCfg', { deep: true })
  regraph() {
    this.$nextTick(() => this.$refs.widgetGraph.resetListeners());
  }

  mounted() {
    this.$watch('widget.cols', () => this.$refs.widgetGraph.refresh());
    this.$watch('widget.rows', () => this.$refs.widgetGraph.refresh());
  }
}
</script>

<template>
  <q-card dark class="text-white column">
    <q-dialog v-model="settingsModalOpen" no-backdrop-dismiss class="row">
      <ScreenSizeConstrained
        v-if="settingsModalOpen"
        :min-width="1500"
        class="q-mr-md"
        style="width: 600px"
      >
        <q-card dark class="q-pa-xs bg-dark-bright" style="min-height: 100px">
          <HistoryGraph :id="widget.id" :config="graphCfg" shared-listeners/>
        </q-card>
      </ScreenSizeConstrained>
      <GraphForm v-if="settingsModalOpen" :crud="crud" :downsampling="downsampling"/>
    </q-dialog>

    <q-dialog v-model="graphModalOpen" maximized>
      <q-card v-if="graphModalOpen" dark>
        <HistoryGraph :id="widget.id" :config="graphCfg" shared-listeners>
          <template v-slot:controls>
            <q-btn-dropdown flat auto-close label="presets" icon="mdi-timelapse">
              <q-list dark link>
                <q-item
                  v-for="(preset, idx) in presets"
                  :active="isActivePreset(preset)"
                  :key="idx"
                  dark
                  clickable
                  @click="applyPreset(preset)"
                >
                  <q-item-section>{{ preset.duration }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-btn v-close-popup flat label="close"/>
          </template>
        </HistoryGraph>
      </q-card>
    </q-dialog>

    <WidgetToolbar :title="widget.title" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat split icon="settings" @click="settingsModalOpen = true">
          <q-list dark bordered>
            <ActionItem
              icon="mdi-chart-line"
              label="Show maximized"
              @click="graphModalOpen = true"
            />
            <ActionItem icon="refresh" label="Refresh" @click="regraph"/>
            <q-expansion-item label="Timespan">
              <q-list dark>
                <q-item
                  v-close-popup
                  v-for="(preset, idx) in presets"
                  :key="idx"
                  :inset-level="1"
                  dark
                  clickable
                  @click="applyPreset(preset)"
                >
                  <q-item-section>{{ preset.duration }}</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
            <WidgetActions :crud="crud"/>
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <div class="col">
      <HistoryGraph
        ref="widgetGraph"
        :id="widget.id"
        :config="graphCfg"
        @downsample="v => downsampling = v"
      />
    </div>
  </q-card>
</template>
