<script lang="ts">
import Component from 'vue-class-component';
import Widget from '@/components/Widget/WidgetBase';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import GraphDisplay from './GraphDisplay.vue';
import { metricById, tryMetricById } from '@/plugins/history/store/getters';
import { Metric, QueryParams, QueryTarget } from '@/plugins/history/state';
import { addPlotlyMetric, removeMetric } from './actions';
import { GraphConfig } from './state';
import { PlotData, Layout } from 'plotly.js';
import { Watch } from 'vue-property-decorator';

@Component({
  components: {
    GraphDisplay,
    WidgetToolbar,
    WidgetModal,
  },
})
export default class GraphWidget extends Widget {
  editing: boolean = false;
  modalOpen: boolean = false;

  get graphCfg(): GraphConfig {
    return this.$props.config;
  }

  set graphCfg(cfg: GraphConfig) {
    this.$props.onConfigChange(this.$props.id, { ...cfg });
  }

  get params(): QueryParams {
    return this.graphCfg.params || {};
  }

  get targets(): QueryTarget[] {
    return this.graphCfg.targets || [];
  }

  get serviceId(): string {
    return this.graphCfg.serviceId;
  }

  metricId(target: QueryTarget): string {
    return `${this.$props.id}/${target.measurement}`;
  }

  get metrics(): Metric[] {
    return this.targets
      .map(target => tryMetricById(this.$store, this.serviceId, this.metricId(target)))
      .filter(metric => metric !== null) as Metric[];
  }

  get ready() {
    return this.metrics.length > 0;
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
        addPlotlyMetric(this.$store, this.metricId(target), this.serviceId, this.params, target));
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
  <div class="widget-container">

    <widget-modal
      :isOpen="modalOpen"
      :onClose="() => { this.modalOpen = false; }"
      :title="$props.id"
    >
      <graph-form
        v-model="graphCfg"
      />
    </widget-modal>

    <widget-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="resetMetrics"
      :on-settings="() => { this.modalOpen = true; }"
    />

    <graph-display
      v-if="ready"
      class="widget-body"
      :data="metricData"
      :layout="metricLayout"
    />
    <div
      v-else
      class="alert-container"
    >
      <q-alert
        icon="warning"
        color="warning"
      >
        No data
      </q-alert>
    </div>


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
