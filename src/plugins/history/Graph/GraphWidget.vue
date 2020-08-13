<script lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import uniq from 'lodash/uniq';
import { Layout } from 'plotly.js';
import { uid } from 'quasar';
import { Component, Ref, Watch } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { bloxQty, Quantity } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import { durationString } from '@/helpers/duration';
import { isJsonEqual } from '@/helpers/functional';
import HistoryGraph from '@/plugins/history/components/HistoryGraph.vue';
import { defaultPresets, emptyGraphConfig } from '@/plugins/history/getters';
import { GraphConfig, QueryParams, QueryTarget } from '@/plugins/history/types';

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
    this.usedCfg = cloneDeep(this.config);
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
    delete config.layout.title;
    this.widget.config = config;
    this.saveWidget(this.widget);
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  isActivePreset(preset: QueryParams): boolean {
    return isJsonEqual(preset, this.config.params);
  }

  saveParams(params: QueryParams): void {
    this.$set(this.config, 'params', params);
    this.saveConfig();
  }

  saveLayout(layout: Partial<Layout>): void {
    this.$set(this.config, 'layout', layout);
    this.saveConfig();
  }

  chooseDuration(): void {
    const current = this.config.params.duration ?? '1h';
    createDialog({
      component: 'DurationQuantityDialog',
      title: 'Custom graph duration',
      value: bloxQty(current),
      label: 'Duration',
    })
      .onOk((v: Quantity) => this.saveParams({ duration: durationString(v) }));
  }

  async regraph(): Promise<void> {
    await this.$nextTick();
    this.usedCfg = cloneDeep(this.config);
    this.widgetGraph?.resetSources();
    this.wrapperGraph?.resetSources();
  }

  async refresh(): Promise<void> {
    await this.$nextTick();
    this.widgetGraph?.refresh();
    this.wrapperGraph?.refresh();
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
      graphId: currentId || uid(),
      config: { ...this.config, layout: { ...this.config.layout, title: this.widget.title } },
      sharedSources: currentId !== null,
      saveParams: v => this.saveParams(v),
    });
  }

  mergeTargets(a: QueryTarget[], b: QueryTarget[]): QueryTarget[] {
    return uniq([...a, ...b].map(v => v.measurement))
      .map(m => {
        const fields = [...a, ...b]
          .filter(target => target.measurement === m)
          .flatMap(target => target.fields);
        return {
          measurement: m,
          fields: uniq(fields),
        };
      });
  }

  startAddBlockGraph(): void {
    createDialog({
      component: 'SelectBlockGraphDialog',
      config: this.config,
    })
      .onOk((cfg: GraphConfig) => {
        const merged = mergeWith(this.config, cfg, (a, b) => {
          return (isArray(b) && b.length && 'measurement' in b[0])
            ? this.mergeTargets(a, b)
            : undefined;
        });
        this.saveConfig(merged);
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
        use-range
        @params="saveParams"
        @layout="saveLayout"
        @downsample="v => downsampling = v"
      />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="mdi-chart-line" label="Show maximized" @click="showGraphDialog" />
          <ActionItem icon="add" label="Add block to graph" @click="startAddBlockGraph" />
          <ExportGraphAction :config="config" :header="widget.title" />
          <ActionItem icon="refresh" label="Refresh" @click="regraph" />
        </template>
        <template #menus>
          <WidgetActions :crud="crud" />
          <GraphRangeSubmenu
            :layout="config.layout"
            :save="v => saveLayout(v)"
          />
          <ActionSubmenu label="Timespan">
            <div class="row wrap" style="max-width: 200px">
              <q-btn
                v-for="(preset, idx) in presets"
                :key="idx"
                flat
                no-caps
                :label="preset.duration"
                :color="isActivePreset(preset) ? 'primary' : 'white'"
                class="col-6"
                @click="saveParams(preset)"
              />
              <q-btn
                flat
                no-caps
                label="Custom"
                class="col-6"
                @click="chooseDuration"
              />
            </div>
          </ActionSubmenu>
        </template>
      </component>
    </template>

    <div
      v-if="mode === 'Basic'"
      class="fit"
    >
      <q-resize-observer :debounce="200" @resize="refresh" />
      <HistoryGraph
        ref="widgetGraph"
        :graph-id="widgetGraphId"
        :config="config"
        @downsample="v => downsampling = v"
      />
    </div>
    <div v-else class="widget-md">
      <GraphEditor
        :config="config"
        :downsampling="downsampling"
        @update:config="saveConfig"
      />
    </div>
  </GraphCardWrapper>
</template>

<style lang="sass" scoped>
.card__Dashboard.card__dense
  height: 100vh !important
</style>
