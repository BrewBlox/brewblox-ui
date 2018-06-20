<script lang="ts">
import Component from 'vue-class-component';

import Metrics from '@/components/metrics/Metrics.vue';

import { updateDashboardItemOptions } from '@/store/dashboards/actions';

import { getMetric, getAvailableMeasurements } from './fetchMetrics';
import { getMetricsFromPath } from './measurementHelpers';

import Widget from '../Widget';

const sortByOrder = (a: MetricsOptions, b: MetricsOptions) => a.order - b.order;

type MetricsOptions = {
  id: string;
  order: number;
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
  fetchingAvailableMeasurements: boolean = true;
  measurementsPaths: string[] = [];
  editing: boolean = false;
  timeout: number = 0;
  updateTimeout: number = 5000;
  metricDuration: string = '5m';
  plotly: PlotlyOptions = {
    data: [],
    layout: {
      title: '',
    },
  };
  nameInput: string = '';

  get name(): string {
    return this.options.name;
  }

  get metrics(): MetricsOptions[] {
    return [...this.options.metrics].sort(sortByOrder);
  }

  toggleEditing() {
    this.nameInput = this.name;

    this.editing = true;
  }

  saveChanges() {
    updateDashboardItemOptions(this.$store, {
      id: this.dashboardItem.id,
      options: {
        ...this.options,
        name: this.nameInput,
      },
    });

    this.editing = false;
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
    this.cancelFetch();

    try {
      type MeasuresType = {
        [key: string]: string[];
      };

      const measures: MeasuresType = this.metrics
        .filter(metric => this.measurementsPaths.indexOf(metric.path) > -1)
        .reduce((acc: MeasuresType, metric) => {
          const measurementKey = this.splitMeasurementKey(metric.path);

          if (!measurementKey) {
            return acc;
          }

          if (!acc[measurementKey.measure]) {
            acc[measurementKey.measure] = [];
          }

          acc[measurementKey.measure].push(measurementKey.key);

          return acc;
        }, {});

      const metricData = await Promise.all(Object.keys(measures)
        .map(measure => getMetric(
          measure,
          measures[measure],
          {
            duration: this.metricDuration,
          },
        )));


      this.updateMetrics(metricData.reduce((acc, metrics) => [...acc, ...metrics], []));

      this.timeout = setTimeout(() => this.fetchMetrics(), this.updateTimeout);
    } catch (e) {
      this.error = e;
    }

    this.fetching = false;
  }

  measurementOptions(path: string) {
    return getMetricsFromPath(this.measurementsPaths, path)
      .map(item => ({ label: item, value: item }));
  }

  metricPaths(path: string) {
    return path.split('/').reduce((acc, item, currentIndex) => (
      [
        ...acc,
        currentIndex === 0 ? item : [acc[currentIndex], item].join('/'),
      ]
    ), ['']);
  }

  onMetricPathChange(metric: MetricsOptions, pathIndex: number, value: string) {
    const newPath = pathIndex !== 0 ?
      [this.metricPaths(metric.path)[pathIndex], value].join('/') :
      value;

    updateDashboardItemOptions(this.$store, {
      id: this.dashboardItem.id,
      options: {
        ...this.options,
        metrics: this.metrics.map((item) => {
          if (item.id === metric.id) {
            return {
              ...item,
              path: newPath,
            };
          }

          return item;
        }),
      },
    });

    this.fetchMetrics();
  }

  removeMetric(metricId: string) {
    updateDashboardItemOptions(this.$store, {
      id: this.dashboardItem.id,
      options: {
        ...this.options,
        metrics: [...this.metrics.filter(item => item.id !== metricId)]
          .sort(sortByOrder)
          .map((item, index) => ({
            id: `metric-${index + 1}`,
            order: index + 1,
            path: item.path,
          })),
      },
    });

    this.fetchMetrics();
  }

  addNewMetric() {
    updateDashboardItemOptions(this.$store, {
      id: this.dashboardItem.id,
      options: {
        ...this.options,
        metrics: [
          ...this.metrics.map((item: MetricsOptions, index: number) =>
            ({ ...item, order: index + 1 })),
          {
            id: `metric-${this.metrics.length + 1}`,
            order: this.metrics.length,
            path: '',
          },
        ],
      },
    });
  }

  cancelFetch() {
    clearTimeout(this.timeout);
  }

  updateMetrics(data: PlotlyData[]) {
    this.$set(this.plotly, 'data', data);
  }

  async fetchAvailableMeasurements() {
    this.measurementsPaths = await getAvailableMeasurements();

    this.fetchingAvailableMeasurements = false;
  }

  mounted() {
    this.fetchAvailableMeasurements().then(() => this.fetchMetrics());
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
@import '../../../css/app.styl';

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
