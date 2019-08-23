<script lang="ts">
import mapValues from 'lodash/mapValues';
import { Layout, PlotData } from 'plotly.js';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { defaultPresets } from '@/components/Graph/getters';
import {
  DisplayNames,
  GraphValueAxes,
  GraphValuesListener,
  historyStore,
  LineColors,
  QueryParams,
  QueryTarget,
} from '@/store/history';

import { addPlotlyListener } from './actions';
import { GraphConfig } from './types';

interface Policies { [measurement: string]: string }

@Component
export default class HistoryGraph extends Vue {
  revision = 0;
  editing = false;

  @Ref() readonly display!: any;

  @Prop({ type: String, required: true })
  readonly id!: string;

  @Prop({ type: Object, required: true })
  readonly config!: GraphConfig;

  @Prop({ type: Boolean, default: false })
  readonly sharedListeners!: boolean;

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

  listenerId(target: QueryTarget): string {
    return `${this.id}/${target.measurement}`;
  }

  get listeners(): GraphValuesListener[] {
    return this.targets
      .map(target => historyStore.tryListenerById(this.listenerId(target)))
      .filter(listener => listener !== null) as GraphValuesListener[];
  }

  get error() {
    if (!this.listeners || this.listeners.length === 0) {
      return 'No data';
    }
    if (!this.graphData.some(data => data.x && data.x.length > 0)) {
      return 'No data (yet) for selected period';
    }
    return null;
  }

  get graphData(): PlotData[] {
    return Object
      .values(this.listeners
        .reduce((acc, listener) => ({ ...acc, ...listener.values }), {}));
  }

  get graphLayout(): Partial<Layout> {
    return this.config.layout;
  }

  get policies(): Policies {
    return this.listeners
      .reduce((acc, listener) => {
        if (listener.target && listener.usedPolicy) {
          acc[listener.target.measurement] = listener.usedPolicy;
        }
        return acc;
      },
        {}
      );
  }

  addListeners() {
    this.targets
      .forEach(target =>
        addPlotlyListener(
          this.listenerId(target),
          this.params,
          this.renames,
          this.axes,
          this.colors,
          target,
        ));
  }

  removeListeners() {
    this.listeners
      .forEach(listener =>
        historyStore.removeListener(listener));
  }

  resetListeners() {
    this.removeListeners();
    this.addListeners();
  }

  mounted() {
    if (!this.sharedListeners) {
      this.addListeners();
    } else {
      this.$nextTick(this.refresh);
    }
  }

  @Watch('policies', { immediate: true })
  publishDownsamplingRate(newVal: Policies, oldVal: Policies) {
    if (newVal && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      const downsampling = mapValues(newVal, policy =>
        policy
          .replace(/autogen/, 'No averaging')
          .replace(/downsample_/, ''));
      this.$emit('downsample', downsampling);
    }
  }

  destroyed() {
    if (!this.sharedListeners) {
      this.removeListeners();
    }
  }

  public refresh() {
    this.revision += 1;
  }
}
</script>

<template>
  <span>
    <!-- Normal display -->
    <Graph
      v-if="!error"
      ref="display"
      :data="graphData"
      :layout="graphLayout"
      :revision="revision"
    />
    <!-- Error message -->
    <q-item v-else dark class="absolute-center">
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
