<script lang="ts">
import { uid } from 'quasar';
import { Component, Ref } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import HistoryGraph from '@/plugins/history/components/HistoryGraph.vue';
import { defaultPresets } from '@/plugins/history/getters';
import { GraphConfig } from '@/plugins/history/types';
import { QueryParams } from '@/store/history';

@Component
export default class GraphWidget extends WidgetBase {
  graphModalOpen = false;
  downsampling: any = {};
  graphId: string | null = null;

  @Ref()
  readonly widgetGraph!: HistoryGraph;

  @Watch('config', { deep: true })
  updateWatcher(newVal: GraphConfig, oldVal: GraphConfig): void {
    if (newVal && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      this.regraph();
    }
  }

  created(): void {
    this.graphId = uid();
  }

  mounted(): void {
    this.$watch('widget.cols', this.refresh);
    this.$watch('widget.rows', this.refresh);
  }

  get config(): GraphConfig {
    return {
      layout: {},
      params: {},
      targets: [],
      renames: {},
      axes: {},
      colors: {},
      ...this.widget.config,
    };
  }

  get graphCardClass(): string[] {
    if (this.inDialog) {
      return this.mode === 'Full'
        ? ['widget-modal']
        : ['widget-modal', 'col', 'column'];
    }
    else {
      return this.mode === 'Full'
        ? ['widget-dashboard', 'overflow-auto', 'scroll']
        : ['widget-dashboard', 'overflow-unset', 'col', 'column'];
    }
  }

  get graphCardStyle(): Mapped<string> {
    return this.inDialog && this.mode === 'Basic'
      ? { height: '60vh' }
      : {};
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  isActivePreset(preset: QueryParams): boolean {
    return JSON.stringify(preset) === JSON.stringify(this.config.params);
  }

  applyPreset(preset: QueryParams): void {
    this.saveConfig({
      ...this.config,
      params: { ...preset },
    });
  }

  async regraph(): Promise<void> {
    await this.$nextTick();
    if (this.widgetGraph !== undefined) {
      this.widgetGraph.resetListeners();
    }
  }

  async refresh(): Promise<void> {
    await this.$nextTick();
    if (this.widgetGraph !== undefined) {
      this.widgetGraph.refresh();
    }
  }
}
</script>

<template>
  <GraphCardWrapper show-initial :show="inDialog && mode === 'Full'">
    <template #graph>
      <HistoryGraph
        :id="graphId"
        ref="widgetGraph"
        :config="config"
        @downsample="v => downsampling = v"
      />
    </template>

    <!-- Full -->
    <q-card v-if="mode === 'Full'" :class="graphCardClass" :style="graphCardStyle" dark>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ExportGraphAction :config="config" :header="widget.title" />
          <WidgetActions :crud="crud" />
        </template>
      </component>
      <div :class="{'col-grow': true, 'scroll-parent': inDialog}">
        <component :is="inDialog ? 'q-scroll-area' : 'div'">
          <GraphEditor :config="config" @update:config="saveConfig" />
        </component>
      </div>
    </q-card>

    <!-- Basic -->
    <q-card v-else dark :class="graphCardClass" :style="graphCardStyle">
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="mdi-chart-line" label="Show maximized" @click="graphModalOpen = true" />
          <ExportGraphAction :config="config" :header="widget.title" />
          <ActionItem icon="refresh" label="Refresh" @click="regraph" />
          <q-expansion-item label="Timespan">
            <q-list dark>
              <q-item
                v-for="(preset, idx) in presets"
                :key="idx"
                v-close-popup
                :inset-level="1"
                :active="isActivePreset(preset)"
                dark
                clickable
                @click="applyPreset(preset)"
              >
                <q-item-section>{{ preset.duration }}</q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
          <WidgetActions :crud="crud" />
        </template>
      </component>

      <q-dialog v-model="graphModalOpen" maximized>
        <q-card v-if="graphModalOpen" dark class="bg-dark">
          <HistoryGraph :id="graphId" :config="config" shared-listeners>
            <template #controls>
              <q-btn-dropdown flat auto-close label="presets" icon="mdi-timelapse">
                <q-list dark link>
                  <q-item
                    v-for="(preset, idx) in presets"
                    :key="idx"
                    :active="isActivePreset(preset)"
                    dark
                    clickable
                    @click="applyPreset(preset)"
                  >
                    <q-item-section>{{ preset.duration }}</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-btn v-close-popup flat label="close" />
            </template>
          </HistoryGraph>
        </q-card>
      </q-dialog>

      <div class="col">
        <HistoryGraph
          :id="graphId"
          ref="widgetGraph"
          :config="config"
          @downsample="v => downsampling = v"
        />
      </div>
    </q-card>
  </GraphCardWrapper>
</template>

<style scoped>
.scroll-parent {
  height: 500px;
  max-height: 60vh;
}
</style>
