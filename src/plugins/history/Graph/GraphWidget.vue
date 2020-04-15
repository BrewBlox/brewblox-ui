<script lang="ts">
import { uid } from 'quasar';
import { Component, Ref, Watch } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import { durationMs, isJsonEqual, unitDurationString } from '@/helpers/functional';
import { Unit } from '@/helpers/units';
import { deepCopy } from '@/helpers/units/parseObject';
import HistoryGraph from '@/plugins/history/components/HistoryGraph.vue';
import { defaultPresets, emptyGraphConfig } from '@/plugins/history/getters';
import { GraphConfig, QueryParams } from '@/plugins/history/types';

@Component
export default class GraphWidget extends WidgetBase<GraphConfig> {
  usedCfg: GraphConfig | null = null;
  downsampling: any = {};

  // Separate IDs for graphs in widget and dialog wrapper
  // This prevents source create/delete race conditions when switching
  widgetGraphId: string | null = null;
  wrapperGraphId: string | null = null;

  @Ref()
  readonly wrapperGraph!: HistoryGraph;

  @Ref()
  readonly widgetGraph!: HistoryGraph;

  @Watch('config')
  watchConfig(newV: GraphConfig): void {
    if (!isJsonEqual(newV, this.usedCfg)) {
      this.regraph();
    }
  }

  created(): void {
    this.usedCfg = deepCopy(this.config);
    this.widgetGraphId = uid();
    this.wrapperGraphId = uid();
  }

  get config(): GraphConfig {
    return {
      ...emptyGraphConfig(),
      ...this.widget.config,
    };
  }

  // We override `this.config`
  // It will not be picked up as default argument to super.saveConfig()
  async saveConfig(config: GraphConfig = this.config): Promise<void> {
    this.widget.config = config;
    this.saveWidget(this.widget);
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  isActivePreset(preset: QueryParams): boolean {
    return isJsonEqual(preset, this.config.params);
  }

  applyParams(params: QueryParams): void {
    this.config.params = { ...params };
    this.saveConfig();
  }

  chooseDuration(): void {
    const current = this.config.params.duration ?? '1h';
    createDialog({
      component: 'TimeUnitDialog',
      parent: this,
      title: 'Custom graph duration',
      value: new Unit(durationMs(current), 'ms'),
      label: 'Duration',
    })
      .onOk(unit => {
        this.config.params = { duration: unitDurationString(unit) };
        this.saveConfig();
      });
  }

  async regraph(): Promise<void> {
    await this.$nextTick();
    this.usedCfg = deepCopy(this.config);
    if (this.widgetGraph !== undefined) {
      this.widgetGraph.resetSources();
    }
    if (this.wrapperGraph !== undefined) {
      this.wrapperGraph.resetSources();
    }
  }

  async refresh(): Promise<void> {
    await this.$nextTick();
    if (this.widgetGraph !== undefined) {
      this.widgetGraph.refresh();
    }
    if (this.wrapperGraph !== undefined) {
      this.wrapperGraph.refresh();
    }
  }

  currentGraphId(): string | null {
    if (this.widgetGraph !== undefined) { return this.widgetGraphId; };
    if (this.wrapperGraph !== undefined) { return this.wrapperGraphId; };
    return null;
  }

  showGraphDialog(): void {
    const currentId = this.currentGraphId();
    createDialog({
      component: 'GraphDialog',
      parent: this,
      graphId: currentId || uid(),
      config: { ...this.config, layout: { ...this.config.layout, title: this.widget.title } },
      sharedSources: currentId !== null,
      saveParams: v => this.applyParams(v),
    });
  }
}
</script>

<template>
  <GraphCardWrapper
    show-initial
    :show="inDialog && mode === 'Full'"
    :no-scroll="mode === 'Basic'"
    v-bind="{context}"
  >
    <template #graph>
      <HistoryGraph
        ref="wrapperGraph"
        :graph-id="wrapperGraphId"
        :config="config"
        use-presets
        @params="applyParams"
        @downsample="v => downsampling = v"
      />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="mdi-chart-line" label="Show maximized" @click="showGraphDialog" />
          <ExportGraphAction :config="config" :header="widget.title" />
          <ActionItem icon="refresh" label="Refresh" @click="regraph" />
        </template>
        <template #menus>
          <WidgetActions :crud="crud" />
          <ActionSubmenu label="Timespan">
            <div class="row wrap" style="max-width: 300px">
              <q-btn
                v-for="(preset, idx) in presets"
                :key="idx"
                :label="preset.duration"
                :color="isActivePreset(preset) ? 'primary' : 'white'"
                class="col-3"
                no-caps
                flat
                @click="applyParams(preset)"
              />
              <q-btn label="Custom" class="col-3" flat no-caps @click="chooseDuration" />
            </div>
          </ActionSubmenu>
        </template>
      </component>
    </template>

    <div v-if="mode === 'Basic'" class="fit">
      <q-resize-observer :debounce="200" @resize="refresh" />
      <HistoryGraph
        ref="widgetGraph"
        :graph-id="widgetGraphId"
        :config="config"
        @downsample="v => downsampling = v"
      />
    </div>
    <div v-else class="widget-md">
      <GraphEditor :config="config" :downsampling="downsampling" @update:config="saveConfig" />
    </div>
  </GraphCardWrapper>
</template>

<style lang="sass" scoped>
.card__Dashboard.card__dense
  height: 100vh !important
</style>
