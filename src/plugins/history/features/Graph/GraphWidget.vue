<script lang="ts">
import Component from 'vue-class-component';
import Widget from '@/components/Widget/Widget';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import GraphDisplay from './GraphDisplay.vue';
import { metricById, tryMetricById } from '@/plugins/history/store/getters';
import { Metric, HistoryOptions } from '@/plugins/history/state';
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

  get options(): HistoryOptions[] {
    return this.graphCfg.options;
  }

  get serviceId(): string {
    return this.graphCfg.serviceId;
  }

  metricId(opt: HistoryOptions): string {
    return `${this.$props.id}/${opt.measurement}`;
  }

  get metrics(): Metric[] {
    return this.options
      .map(opt => tryMetricById(this.$store, this.serviceId, this.metricId(opt)))
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
    this.options
      .forEach(opt =>
        addPlotlyMetric(this.$store, this.metricId(opt), this.serviceId, opt));
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
      <GraphForm
        v-model="graphCfg"
      />
    </widget-modal>

    <widget-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="resetMetrics"
      :on-settings="() => { this.modalOpen = true; }"
    />

    <GraphDisplay
      class="widget-body"
      v-if="ready"
      :data="metricData"
      :layout="metricLayout"
    />

  </div>
</template>

<style scoped>
</style>
