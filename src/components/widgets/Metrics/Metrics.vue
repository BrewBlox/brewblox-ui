<script lang="ts">
import Component from 'vue-class-component';

import Metrics from '@/components/metrics/Metrics.vue';
import { blockById } from '@/store/blocks/getters';

import { getMetric } from './fetchMetrics';

import Widget from '../Widget';

type MetricsOptions = {
  id: string,
  fields: string[],
};

/* eslint-disable */
@Component({
  components: {
    Metrics,
  },
})
/* eslint-enable */
class MetricsWidget extends Widget {
  error: Error | null;
  fetching: boolean = true;
  interval: number = 0;
  updateInterval: number = 5000;
  metricDuration: string = '5m';
  plotly: PlotlyOptions = {
    data: [],
    layout: {
      title: '',
    },
  };

  get name(): string {
    return this.options.name;
  }

  get metrics(): MetricsOptions[] {
    return this.options.metrics;
  }

  async fetchMetrics() {
    try {
      const metricData = await Promise.all(this.metrics.map(metric =>
        getMetric(
          blockById(this.$store, metric.id).serviceId,
          metric.fields,
          {
            duration: this.metricDuration,
          },
        )));

      this.updateMetrics(metricData.reduce((acc, metrics) => [...acc, ...metrics], []));
    } catch (e) {
      this.error = e;
    }

    this.fetching = false;
  }

  updateMetrics(data: PlotlyData[]) {
    this.$set(this.plotly, 'data', data);
  }

  setPlotName() {
    this.$set(this.plotly.layout, 'title', this.name);
  }

  mounted() {
    this.setPlotName();

    this.fetchMetrics();
    this.interval = setInterval(() => this.fetchMetrics(), this.updateInterval);
  }

  destroyed() {
    clearInterval(this.interval);
  }
}

export default MetricsWidget;
</script>

<template>
  <q-inner-loading visible v-if="fetching">
    <q-spinner
      size="50px"
      color="primary"
    />
  </q-inner-loading>
  <div
    class="metrics-container"
    v-else
  >
    <Metrics
      v-if="!error"
      :data="plotly"
    />
    <q-alert
      v-if="error"
      icon="warning"
      color="negative"
    >
      {{ error.message }}
    </q-alert>
  </div>
</template>

<style>
.metrics-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
