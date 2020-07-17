<script lang="ts">
import mapValues from 'lodash/mapValues';
import { Layout, PlotData } from 'plotly.js';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { isJsonEqual } from '@/helpers/functional';
import { defaultPresets } from '@/plugins/history/getters';
import { addSource } from '@/plugins/history/sources/graph';
import { historyStore } from '@/plugins/history/store';
import {
  DisplayNames,
  GraphConfig,
  GraphSource,
  GraphValueAxes,
  LineColors,
  QueryParams,
  QueryTarget,
} from '@/plugins/history/types';

import { addDensitySource } from '../sources/density-graph';

interface Policies { [measurement: string]: string }

@Component
export default class HistoryGraph extends Vue {
  revision = 0;
  editing = false;

  @Ref() readonly display!: any;

  @Prop({ type: String, required: true })
  readonly graphId!: string;

  @Prop({ type: Object, required: true })
  readonly config!: GraphConfig;

  @Prop({ type: Boolean, default: false })
  readonly sharedSources!: boolean;

  @Prop({ type: String, default: '' })
  public readonly refreshTrigger!: string;

  @Prop({ type: Boolean, default: false })
  public readonly usePresets!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly useRange!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly density!: boolean;

  @Watch('refreshTrigger')
  watchRefresh(): void {
    this.refresh();
  }

  @Watch('config')
  watchConfig(newV: GraphConfig, oldV: GraphConfig): void {
    if (!isJsonEqual(newV, oldV)) {
      this.resetSources();
    }
  }

  @Watch('policies', { immediate: true })
  publishDownsamplingRate(newVal: Policies, oldVal: Policies): void {
    if (newVal && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      const downsampling = mapValues(newVal, policy =>
        policy
          .replace(/autogen/, 'No averaging')
          .replace(/downsample_/, ''));
      this.$emit('downsample', downsampling);
    }
  }

  mounted(): void {
    if (!this.sharedSources) {
      this.addSources();
    } else {
      this.$nextTick(this.refresh);
    }
  }

  destroyed(): void {
    if (!this.sharedSources) {
      this.removeSources();
    }
  }

  get params(): QueryParams {
    return this.config.params ?? {};
  }

  get targets(): QueryTarget[] {
    return this.config.targets ?? [];
  }

  get renames(): DisplayNames {
    return this.config.renames ?? {};
  }

  get axes(): GraphValueAxes {
    return this.config.axes ?? {};
  }

  get colors(): LineColors {
    return this.config.colors ?? {};
  }

  get layout(): Partial<Layout> {
    return this.config.layout;
  }

  saveParams(params: QueryParams): void {
    this.$emit('params', { ...params });
  }

  saveLayout(layout: Partial<Layout>) {
    this.$emit('layout', { ...layout });
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  isActivePreset(preset: QueryParams): boolean {
    return isJsonEqual(preset, this.config.params);
  }

  sourceId(target: QueryTarget): string {
    return `${this.graphId}/${target.measurement}`;
  }

  get densityId(): string {
    return `${this.graphId}/__DENSITY__`;
  }

  get sources(): GraphSource[] {
    if (this.density) {
      return [historyStore.sourceById(this.densityId)]
        .filter(source => source !== null && !!source.values) as GraphSource[];
    }
    return this.targets
      .map(target => historyStore.sourceById(this.sourceId(target)))
      .filter(source => source !== null && !!source.values) as GraphSource[];
  }

  get error(): string | null {
    if (!this.sources || this.sources.length === 0) {
      return this.targets.length > 0
        ? 'No data sources'
        : 'No fields selected';
    }
    if (!this.graphData.some(data => data.x && data.x.length > 0)) {
      return 'No data (yet) for selected period';
    }
    return null;
  }

  get graphData(): PlotData[] {
    return this.sources
      .flatMap(source => Object.values(source.values));
  }

  get policies(): Policies {
    const result: Policies = {};
    this.sources.forEach(source => {
      if (source.target && source.usedPolicy) {
        result[source.target.measurement] = source.usedPolicy;
      }
    });
    return result;
  }

  addSources(): void {
    if (this.density) {
      addDensitySource(this.densityId, this.params);
      return;
    }
    this.targets.forEach(target =>
      addSource(
        this.sourceId(target),
        this.params,
        this.renames,
        this.axes,
        this.colors,
        target,
      ));
  }

  removeSources(): void {
    this.sources.forEach(historyStore.removeSource);
  }

  resetSources(): void {
    this.removeSources();
    this.addSources();
  }

  public refresh(): void {
    this.revision += 1;
  }
}
</script>

<template>
  <div class="fit column">
    <div class="col-auto row justify-end z-top">
      <ActionMenu
        v-if="useRange"
        icon="mdi-arrow-expand-vertical"
      >
        <template #menus>
          <GraphRangeSubmenu
            :layout="layout"
            :save="v => saveLayout(v)"
          />
        </template>
      </ActionMenu>
      <ActionMenu
        v-if="usePresets"
        icon="mdi-timelapse"
      >
        <template #menus>
          <ActionSubmenu label="Presets">
            <ActionItem
              v-for="(preset, idx) in presets"
              :key="`preset-${idx}`"
              :active="isActivePreset(preset)"
              :label="`${preset.duration}`"
              @click="saveParams(preset)"
            />
          </ActionSubmenu>
        </template>
      </ActionMenu>
      <slot name="controls" />
    </div>
    <div v-if="error" class="col row justify-center items-center text-h5 q-gutter-x-md">
      <q-icon name="warning" color="negative" />
      <div class="col-auto">
        {{ error }}
      </div>
    </div>
    <div v-else class="col">
      <GenericGraph
        ref="display"
        :data="graphData"
        :layout="layout"
        :revision="revision"
        v-bind="$attrs"
        v-on="$listeners"
      />
    </div>
  </div>
</template>
