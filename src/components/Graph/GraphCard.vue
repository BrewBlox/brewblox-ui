<script lang="ts">
import mapValues from 'lodash/mapValues';
import { Layout, PlotData } from 'plotly.js';
import { setTimeout } from 'timers';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

import { defaultPresets } from '@/components/Graph/getters';
import historyStore from '@/store/history';
import { DisplayNames, GraphValueAxes, GraphValuesListener, QueryParams, QueryTarget } from '@/store/history';

import GraphDisplay from './GraphDisplay.vue';
import { addPlotlyListener } from './actions';
import { GraphConfig } from './types';

interface Policies { [measurement: string]: string }

@Component({
  props: {
    id: {
      type: String,
      required: true,
    },
    config: {
      type: Object, // GraphConfig
      default: () => ({}),
    },
    sharedListeners: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    GraphDisplay,
  },
})
export default class GraphCard extends Vue {
  revision: number = 0;
  editing: boolean = false;
  $refs!: {
    display: any;
  }

  get graphCfg(): GraphConfig {
    return this.$props.config;
  }

  get params(): QueryParams {
    return this.graphCfg.params || {};
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  get targets(): QueryTarget[] {
    return this.graphCfg.targets || [];
  }

  get renames(): DisplayNames {
    return this.graphCfg.renames || {};
  }

  get axes(): GraphValueAxes {
    return this.graphCfg.axes || {};
  }

  listenerId(target: QueryTarget): string {
    return `${this.$props.id}/${target.measurement}`;
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
    return null;
  }

  get graphData(): PlotData[] {
    return Object
      .values(this.listeners
        .reduce((acc, listener) => ({ ...acc, ...listener.values }), {}));
  }

  get graphLayout(): Partial<Layout> {
    return this.graphCfg.layout;
  }

  get policies(): Policies {
    return this.listeners
      .reduce((acc, listener) => ({ ...acc, [listener.target.measurement]: listener.usedPolicy || 'No data' }), {});
  }

  addListeners() {
    this.targets
      .forEach(target =>
        addPlotlyListener(
          this.listenerId(target),
          this.params,
          this.renames,
          this.axes,
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
    if (!this.$props.sharedListeners) {
      this.addListeners();
    } else {
      this.$nextTick(() => this.refresh());
    }
    // There's a race condition where the Plotly SVG renders just before it gets its correct size
    // The next re-render might take minutes or seconds, depending on the graph data
    // This is the brute force approach to rectifying the problem quickly if it shows
    setTimeout(() => this.refresh(), 1000);
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
    if (!this.$props.sharedListeners) {
      this.removeListeners();
    }
  }

  public refresh() {
    this.revision += 1;
  }
}
</script>

<template>
  <div class="parent">
    <GraphDisplay
      v-if="!error"
      ref="display"
      :data="graphData"
      :layout="graphLayout"
      :revision="revision"
    />
    <q-item v-else dark class="absolute-center">
      <q-item-section avatar>
        <q-icon name="warning"/>
      </q-item-section>
      <q-item-section>{{ error }}</q-item-section>
    </q-item>

    <div class="row graph-controls z-top">
      <slot/>
    </div>
  </div>
</template>

<style scoped>
.parent {
  width: 100%;
  height: 100%;
}
</style>

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
