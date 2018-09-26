<script lang="ts">
import Component from 'vue-class-component';

import Widget from '@/components/Widget/Widget';

import { getMetric, getAvailableMeasurements, subscribeToEvents } from './fetchMetrics';
import { getMetricsFromPath } from './measurementHelpers';

import MetricsDisplay from './MetricsDisplay.vue';

import { MetricsOptions, MeasuresType, PlotlyData, PlotlyOptions } from './state';

const sortByOrder = (a: MetricsOptions, b: MetricsOptions) => a.order - b.order;

@Component({
  components: {
    MetricsDisplay,
  },
})
export default class MetricsWidget extends Widget {
  fetching: boolean = true;
  editing: boolean = false;
  fetchingAvailableMeasurements: boolean = true;
  error: Error | null = null;

  initialRange = 5 * 60 * 1000;
  timeout: number = 0;
  metricDuration: string = '30m';

  nameInput: string = '';

  measurementsPaths: string[] = [];
  plotly: PlotlyOptions = {
    data: [],
    layout: {
      title: '',
    },
  };
  eventSources: {
    [key: string]: EventSource;
  } = {};

  get name(): string {
    return this.$props.config.name;
  }

  get metrics(): MetricsOptions[] {
    return [...this.$props.config.metrics].sort(sortByOrder);
  }

  toggleEditing() {
    this.nameInput = this.name;
    this.editing = true;
  }

  saveChanges() {
    this.$props.onConfigChange(
      this.$props.id,
      {
        ...this.$props.config,
        name: this.nameInput,
      },
    );
    this.editing = false;
  }

  splitMeasurementKey(path: string): { measure: string, key: string } | null {
    const result = path.match(/^([A-Za-z0-9_-]+)\/(.+)$/);

    return result
      ? { measure: result[1], key: result[2] }
      : null;
  }

  getMeasures(): MeasuresType {
    const reducer = (acc: MeasuresType, metric: any) => {
      const measurementKey = this.splitMeasurementKey(metric.path);
      if (!measurementKey) {
        return acc;
      }
      if (!acc[measurementKey.measure]) {
        acc[measurementKey.measure] = [];
      }
      acc[measurementKey.measure].push(measurementKey.key);
      return acc;
    };

    return this.metrics
      .filter(metric => this.measurementsPaths.indexOf(metric.path) > -1)
      .reduce(reducer, {});
  }

  async fetchMetrics() {
    this.cancelFetch();

    try {
      const measures = this.getMeasures();

      const metricData = await Promise.all(Object.keys(measures)
        .map(measure => getMetric(
          measure,
          measures[measure],
          { duration: this.metricDuration },
        )));

      this.updateMetrics(metricData.reduce((acc, metrics) => [...acc, ...metrics], []));

      this.subscribeSSE();
    } catch (e) {
      this.error = e;
    }

    this.fetching = false;
  }

  get eventSourcesList(): EventSource[] {
    return Object.keys(this.eventSources).map(key => this.eventSources[key]);
  }

  subscribeSSE() {
    this.closeSSEConnections();

    const measures = this.getMeasures();

    this.eventSources = Object.keys(measures).reduce(
      (acc, measure) => ({
        ...acc,
        [measure]: subscribeToEvents(measure, measures[measure], this.updateMetrics),
      }),
      {},
    );
  }

  closeSSEConnections() {
    this.eventSourcesList.forEach(source => source.close());
  }

  measurementOptions(path: string) {
    return getMetricsFromPath(this.measurementsPaths, path)
      .map(item => ({ label: item, value: item }));
  }

  metricPaths(path: string) {
    return path.split('/').reduce(
      (acc, item, currentIndex) => (
        [
          ...acc,
          currentIndex === 0 ? item : [acc[currentIndex], item].join('/'),
        ]
      ),
      [''],
    );
  }

  onMetricPathChange(metric: MetricsOptions, pathIndex: number, value: string) {
    const newPath = (pathIndex !== 0)
      ? [this.metricPaths(metric.path)[pathIndex], value].join('/')
      : value;

    const cfg = {
      ...this.$props.config,
      metrics: this.metrics
        .map(item => (item.id === metric.id
          ? { ...item, path: newPath }
          : item)),
    };
    this.$props.onConfigChange(this.$props.id, cfg);
    this.fetchMetrics();
  }

  removeMetric(metricId: string) {
    const cfg = {
      ...this.$props.config,
      metrics: [...this.metrics.filter(item => item.id !== metricId)]
        .sort(sortByOrder)
        .map((item, index) => ({
          id: `metric-${index + 1}`,
          order: index + 1,
          path: item.path,
        })),
    };
    this.$props.onConfigChange(this.$props.id, cfg);
    this.fetchMetrics();
  }

  addNewMetric() {
    const cfg = {
      ...this.$props.config,
      metrics: [
        // existing
        ...this.metrics
          .map((item: MetricsOptions, index: number) =>
            ({ ...item, order: index + 1 })),
        // new
        {
          id: `metric-${this.metrics.length + 1}`,
          order: this.metrics.length,
          path: '',
        },
      ],
    };
    this.$props.onConfigChange(this.$props.id, cfg);
  }

  cancelFetch() {
    clearTimeout(this.timeout);
  }

  updateMetrics(data: PlotlyData[]) {
    this.$set(this.plotly, 'data', data || []);
  }

  async fetchAvailableMeasurements() {
    this.measurementsPaths = await getAvailableMeasurements(this.$props.config.serviceId);
    this.fetchingAvailableMeasurements = false;
  }

  mounted() {
    this.fetchAvailableMeasurements()
      .then(() => this.fetchMetrics());
  }

  destroyed() {
    this.cancelFetch();
    this.closeSSEConnections();
  }
}
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
        <div v-if="!editing">
          {{ name }}
        </div>
        <div v-else>
          <q-input
            v-model="nameInput"
            placeholder="Name of this plot"
            dark
            :before="[{ icon: 'edit' }]"
          />
        </div>
      </q-toolbar-title>

      <q-btn
        :flat="!editing"
        :color="editing ? 'positive' : 'default'"
        :round="!editing"
        :dense="!editing"
        :icon="editing ? 'check' : 'settings'"
        @click="editing ? saveChanges() : toggleEditing()"
        :label="editing ? 'Save changes' : 'Configure graph'"
      />
    </q-toolbar>
    <MetricsDisplay
      v-if="error === null"
      :inputOptions="plotly"
      :initialRange="initialRange"
    />
    <div v-if="error" class="alert-container">
      <q-alert
        icon="warning"
        color="negative"
      >
        {{ error.message }}
      </q-alert>
    </div>
    <div v-if="editing && !fetchingAvailableMeasurements" class="editing-container">
      <div
        class="metrics-edit-container"
        v-for="metric in metrics"
        :key="metric.id"
      >
        <q-icon name="show_chart" />
        <q-select
          v-for="(searchPath, index) in metricPaths(metric.path)"
          v-if="
            measurementsPaths.indexOf(searchPath) === -1 &&
            ((index !== 1 && searchPath === '') || searchPath !== '')
          "
          :key="searchPath"
          :options="measurementOptions(searchPath)"
          :value="metric.path.split('/')[index]"
          @change="val => onMetricPathChange(metric, index, val)"
        />

        <q-icon
          name="check"
          color="positive"
          v-if="measurementsPaths.indexOf(metric.path) > -1"
        />

        <q-btn
          flat
          round
          dense
          icon="delete"
          label="Remove metric"
          @click="removeMetric(metric.id)"
        />
      </div>

      <q-btn
        icon="add"
        label="Add metric"
        color="primary"
        @click="addNewMetric"
      />
    </div>
  </div>
</template>

<style lang="stylus">
@import '../../../../../src/css/app.styl';

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

.metrics-container .q-toolbar {
  position: absolute;
  top: 0;
  z-index: 2;
}

.metrics-container .js-plotly-plot {
  position: absolute;
  top: 0;
  z-index: 1;
}

.editing-container {
  width: 100%;
  position: absolute;
  top: 100%;
}

.metrics-edit-container > .q-icon {
  margin: 0 15px 0 5px;
}

.metrics-edit-container {
  background: $dark;
  padding: 10px;
  display: flex;
  margin-bottom: 10px;
}

.metrics-edit-container .q-select {
  width: 160px;
  margin-right: 15px;
}

.metrics-edit-container .q-btn.q-btn-flat {
  margin-left: auto;
}
</style>
