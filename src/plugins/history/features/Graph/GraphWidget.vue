<script lang="ts">
import Component from 'vue-class-component';
import Widget from '@/components/Widget/Widget';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import GraphDisplay from './GraphDisplay.vue';
import { metricById, tryMetricById } from '@/plugins/history/store/getters';
import { Metric, GraphConfig, HistoryOptions } from '@/plugins/history/state';
import { addPlotlyMetric, removeMetric } from './actions';
import { PlotData, Layout } from 'plotly.js';

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
  defaultConfig: Partial<Layout> = {};

  get graphCfg(): GraphConfig {
    return this.$props.config;
  }

  get title() {
    return this.graphCfg.title;
  }

  get options(): HistoryOptions {
    return this.graphCfg.options;
  }

  set options(opts: HistoryOptions) {
    this.$props.onConfigChange(this.$props.id, { ...this.graphCfg, options: opts });
  }

  get serviceId(): string {
    return this.graphCfg.serviceId;
  }

  get metricId(): string {
    // Using one metric per graph for now
    return this.$props.id;
  }

  get metric(): Metric | null {
    return tryMetricById(this.$store, this.serviceId, this.metricId);
  }

  get ready() {
    return this.metric !== null;
  }

  get metricData(): PlotData[] {
    return this.metric
      ? Object.values(this.metric.values)
      : [];
  }

  get metricLayout(): Layout {
    return this.metric
      ? this.metric.config
      : {};
  }

  mounted() {
    addPlotlyMetric(
      this.$store,
      this.metricId,
      this.serviceId,
      this.options,
      this.defaultConfig,
    );
  }

  destroyed() {
    if (this.metric) {
      removeMetric(this.$store, this.serviceId, this.metric);
    }
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
        v-model="options"
      />
    </widget-modal>

    <widget-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="() => { }"
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
