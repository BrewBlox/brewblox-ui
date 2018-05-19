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
  error: Error | null = null;
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
            duration: this.options.limit ? undefined : this.metricDuration,
            limit: this.options.limit || undefined,
            order_by: this.options.limit === 1 ? 'time DESC' : undefined,
          },
        )));

      this.updateMetrics(metricData
        .reduce((acc, metrics) => [...acc, ...metrics], [])
        .map((metric, index) => {
          if (this.options.limit === 1 && metric.y[0] === null) {
            return {
              ...metric,
              y: this.plotly.data[index].y,
            };
          }

          return metric;
        }));
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
    <q-list
      class="metric-values"
      v-if="error === null && options.limit === 1"
    >
      <q-item>
        <q-item-side
          class="metric-values-item"
          v-for="metric in plotly.data"
          :key="metric.uid"
        >
          <q-item-tile sublabel>{{ metric.name }}</q-item-tile>
          <q-item-tile
            label
            class="q-display-2"
          >
            {{ metric.y[0] }}
          </q-item-tile>
        </q-item-side>
      </q-item>
    </q-list>
    <Metrics
      v-if="error === null && options.limit !== 1"
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
.dashboard-item.metrics-container {
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.metric-values {
  border: 0;
  width: 100%;
}

.metric-values-item {
  flex-grow: 1;
  flex-shrink: 0;
  width: 25%;
}
</style>
