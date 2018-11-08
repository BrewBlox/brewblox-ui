<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import GraphDisplay from './GraphDisplay.vue';
import { metricById, tryMetricById } from '@/plugins/history/store/getters';
import { Metric, QueryParams, QueryTarget, DisplayNames } from '@/plugins/history/state';
import { GraphConfig } from './state';
import { addPlotlyMetric, removeMetric } from './actions';
import { PlotData, Layout } from 'plotly.js';
import { serviceExists } from '@/store/services/getters';

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
  },
  components: {
    GraphDisplay,
  },
})
export default class GraphCard extends Vue {
  editing: boolean = false;

  get graphCfg(): GraphConfig {
    return this.$props.config;
  }

  get params(): QueryParams {
    return this.graphCfg.params || {};
  }

  get targets(): QueryTarget[] {
    return this.graphCfg.targets || [];
  }

  get renames(): DisplayNames {
    return this.graphCfg.renames || {};
  }

  get serviceId(): string {
    return this.graphCfg.serviceId || 'history';
  }

  metricId(target: QueryTarget): string {
    return `${this.$props.id}/${target.measurement}`;
  }

  get metrics(): Metric[] {
    return this.targets
      .map(target => tryMetricById(this.$store, this.serviceId, this.metricId(target)))
      .filter(metric => metric !== null) as Metric[];
  }

  get error() {
    if (this.metrics.length === 0) {
      return 'No data';
    }

    if (!serviceExists(this.$store, this.serviceId)) {
      return `Service ${this.serviceId} not available`;
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
          this.serviceId,
          this.params,
          this.renames,
          target,
        ));
  }

  removeMetrics() {
    this.metrics
      .forEach(metric =>
        removeMetric(this.$store, this.serviceId, metric));
  }

  @Watch('graphCfg', { immediate: true, deep: true })
  resetMetrics() {
    this.removeMetrics();
    this.addMetrics();
  }

  destroyed() {
    this.removeMetrics();
  }
}
</script>

<template>
    <graph-display
      v-if="!error"
      :data="metricData"
      :layout="metricLayout"
    />
    <div v-else class="alert-container">
      <q-alert icon="warning" color="warning">{{ error }}</q-alert>
    </div>
</template>

<style scoped>
.alert-container {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
