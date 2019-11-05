<script lang="ts">
import { uid } from 'quasar';
import { CreateElement, VNode } from 'vue';
import { Component, Ref } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import HistoryGraph from '@/plugins/history/components/HistoryGraph.vue';
import { defaultPresets, emptyGraphConfig } from '@/plugins/history/getters';
import { GraphConfig } from '@/plugins/history/types';
import { QueryParams } from '@/store/history';

@Component
export default class GraphWidget extends WidgetBase<GraphConfig> {
  downsampling: any = {};
  graphId: string | null = null;

  @Ref()
  readonly widgetGraph!: HistoryGraph;

  created(): void {
    this.graphId = uid();
  }

  mounted(): void {
    this.$watch('widget.cols', this.refresh);
    this.$watch('widget.rows', this.refresh);
  }

  get config(): GraphConfig {
    return {
      ...emptyGraphConfig(),
      ...this.widget.config,
    };
  }

  saveConfig(config: GraphConfig = this.config): void {
    this.widget.config = config;
    this.saveWidget(this.widget);
    this.regraph();
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
    this.config.params = { ...preset };
    this.saveConfig();
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

  renderControls(h: CreateElement): VNode {
    return h('q-btn-dropdown',
      {
        props: {
          flat: true,
          autoClose: true,
          label: 'presets',
          icon: 'mdi-timelapse',
        },
      },
      [
        h('q-list',
          { props: { dark: true, link: true } },
          [
            defaultPresets().map(preset =>
              h('q-item',
                {
                  props: {
                    dark: true,
                    clickable: true,
                    active: this.isActivePreset(preset),
                  },
                  on: { click: () => this.applyPreset(preset) },
                },
                [
                  h('q-item-section', [preset.duration]),
                ])),
          ]),
      ]);
  }

  showGraphDialog(): void {
    createDialog({
      component: 'GraphDialog',
      parent: this,
      graphId: this.graphId,
      config: { ...this.config, layout: { ...this.config.layout, title: this.widget.title } },
      sharedListeners: this.widgetGraph !== undefined,
      renderControls: this.renderControls,
    });
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

    <!-- Basic -->
    <q-card v-if="mode === 'Basic'" :class="graphCardClass" :style="graphCardStyle">
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="mdi-chart-line" label="Show maximized" @click="showGraphDialog" />
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
      <div class="col">
        <HistoryGraph
          :id="graphId"
          ref="widgetGraph"
          :config="config"
          @downsample="v => downsampling = v"
        />
      </div>
    </q-card>

    <!-- Full -->
    <q-card v-if="mode === 'Full'" :class="graphCardClass" :style="graphCardStyle">
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="mdi-chart-line" label="Show maximized" @click="showGraphDialog" />
          <ExportGraphAction :config="config" :header="widget.title" />
          <ActionItem icon="refresh" label="Refresh" @click="regraph" />
          <WidgetActions :crud="crud" />
        </template>
      </component>
      <div :class="{'col-grow': true, 'scroll-parent': inDialog}">
        <component :is="inDialog ? 'q-scroll-area' : 'div'">
          <GraphEditor :config="config" :downsampling="downsampling" @update:config="saveConfig" />
        </component>
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
