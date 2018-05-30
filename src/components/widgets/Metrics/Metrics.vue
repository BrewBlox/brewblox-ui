<script lang="ts">
import Component from 'vue-class-component';

import Metrics from '@/components/metrics/Metrics.vue';

import { getMetric, getAvailableMeasurements } from './fetchMetrics';

import Widget from '../Widget';

type MetricsOptions = {
  name: string;
  path: string;
};

/* eslint-disable */
@Component({
  components: {
    Metrics,
  },
})
/* eslint-enable */
class MetricsWidget extends Widget {
  error: Error | null = null;
  fetching: boolean = true;
  timeout: number = 0;
  updateTimeout: number = 5000;
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

  splitMeasurementKey(path: string): { measure: string, key: string } | null {
    const result = path.match(/^([A-Za-z0-9_-]+)\/(.+)$/);

    if (!result) {
      return null;
    }

    return {
      measure: result[1],
      key: result[2],
    };
  }

  async fetchMetrics() {
    try {
      const metricData = await Promise.all(this.metrics.map((metric) => {
        const measurementKey = this.splitMeasurementKey(metric.path);

        if (!measurementKey) {
          return Promise.resolve([]);
        }

        return getMetric(
          measurementKey.measure,
          [measurementKey.key],
          { duration: this.metricDuration },
        );
      }));


      this.updateMetrics(metricData.reduce((acc, metrics) => [...acc, ...metrics], []));

      this.timeout = setTimeout(() => this.fetchMetrics(), this.updateTimeout);
    } catch (e) {
      this.error = e;
    }

    this.fetching = false;
  }

  cancelFetch() {
    clearTimeout(this.timeout);
  }

  updateMetrics(data: PlotlyData[]) {
    this.$set(this.plotly, 'data', data);
  }

  mounted() {
    this.fetchMetrics();

    getAvailableMeasurements();
  }

  destroyed() {
    this.cancelFetch();
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

  <div v-else class="metrics-container">
    <q-toolbar color="dark-bright">
      <q-toolbar-title>
        {{ name }}
      </q-toolbar-title>

      <q-btn
        flat
        round
        dense
        icon="settings"
      />
    </q-toolbar>
    <Metrics
      v-if="error === null"
      :data="plotly"
    />
    <div v-if="error" class="alert-container">
      <q-alert
        icon="warning"
        color="negative"
      >
        {{ error.message }}
      </q-alert>
    </div>
  </div>
</template>

<style>
.dashboard-item.metrics-container {
  background: transparent;
  display: flex;
  flex-direction: column;
}

.alert-container {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
