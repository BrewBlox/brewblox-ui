<script lang="ts">
import mapValues from 'lodash/mapValues';
import { Layout, PlotData } from 'plotly.js';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

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

  get params(): QueryParams {
    return this.config.params || {};
  }

  get targets(): QueryTarget[] {
    return this.config.targets || [];
  }

  get renames(): DisplayNames {
    return this.config.renames || {};
  }

  get axes(): GraphValueAxes {
    return this.config.axes || {};
  }

  get colors(): LineColors {
    return this.config.colors || {};
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  sourceId(target: QueryTarget): string {
    return `${this.graphId}/${target.measurement}`;
  }

  get sources(): GraphSource[] {
    return this.targets
      .map(target => historyStore.trySourceById(this.sourceId(target)))
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

  get graphLayout(): Partial<Layout> {
    return this.config.layout;
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

  mounted(): void {
    if (!this.sharedSources) {
      this.addSources();
    } else {
      this.$nextTick(this.refresh);
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

  destroyed(): void {
    if (!this.sharedSources) {
      this.removeSources();
    }
  }

  public refresh(): void {
    this.revision += 1;
  }
}
</script>

<template>
  <span>
    <!-- Normal display -->
    <GenericGraph
      v-if="!error"
      ref="display"
      :data="graphData"
      :layout="graphLayout"
      :revision="revision"
    />
    <!-- Error message -->
    <q-item v-else class="absolute-center">
      <q-item-section avatar>
        <q-icon name="warning" />
      </q-item-section>
      <q-item-section>{{ error }}</q-item-section>
    </q-item>

    <div class="row graph-controls z-top">
      <slot name="controls" />
    </div>
  </span>
</template>

<style scoped lang="stylus">
.graph-controls {
  position: absolute;
  top: 10px;
  right: 10px;
}

/deep/ .graph-controls .q-field * {
  align-items: center;
  margin-top: 0px !important;
}
</style>
