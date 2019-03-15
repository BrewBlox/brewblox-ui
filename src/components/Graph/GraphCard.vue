<script lang="ts">
import { tryMetricById } from '@/store/history/getters';
import { defaultPresets } from '@/components/Graph/getters';
import { DisplayNames, Metric, QueryParams, QueryTarget, ValueAxes } from '@/store/history/state';
import { Layout, PlotData } from 'plotly.js';
import Vue from 'vue';
import Component from 'vue-class-component';
import { addPlotlyMetric, removeMetric } from './actions';
import GraphDisplay from './GraphDisplay.vue';
import { GraphConfig } from './state';

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
    sharedMetrics: {
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

  get axes(): ValueAxes {
    return this.graphCfg.axes || {};
  }

  metricId(target: QueryTarget): string {
    return `${this.$props.id}/${target.measurement}`;
  }

  get metrics(): Metric[] {
    return this.targets
      .map(target => tryMetricById(this.$store, this.metricId(target)))
      .filter(metric => metric !== null) as Metric[];
  }

  get error() {
    if (!this.metrics || this.metrics.length === 0) {
      return 'No data';
    }
    return null;
  }

  get metricData(): PlotData[] {
    return Object
      .values(this.metrics
        .reduce((acc, metric) => ({ ...acc, ...metric.values }), {}));
  }

  get metricLayout(): Partial<Layout> {
    return this.graphCfg.layout;
  }

  addMetrics() {
    this.targets
      .forEach(target =>
        addPlotlyMetric(
          this.$store,
          this.metricId(target),
          this.params,
          this.renames,
          this.axes,
          target,
        ));
  }

  removeMetrics() {
    this.metrics
      .forEach(metric =>
        removeMetric(this.$store, metric));
  }

  resetMetrics() {
    this.removeMetrics();
    this.addMetrics();
  }

  mounted() {
    if (!this.$props.sharedMetrics) {
      this.addMetrics();
    } else {
      this.$nextTick(() => this.refresh());
    }
  }

  destroyed() {
    if (!this.$props.sharedMetrics) {
      this.removeMetrics();
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
      :data="metricData"
      :layout="metricLayout"
      :revision="revision"
    />
    <div v-else class="alert-container">
      <q-alert icon="warning" color="warning">{{ error }}</q-alert>
    </div>
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
.alert-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
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
