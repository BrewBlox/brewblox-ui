import Vue from 'vue';
import Component from 'vue-class-component';
import * as Plotly from 'plotly.js';

import { getById } from '../../store/blocks/OneWireTempSensor/getters';
import { findBlockWithMetrics } from '../../store/blocks/actions';

@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
export default class Metrics extends Vue {
  plotly: any;

  get blockData() {
    return getById(this.$props.id);
  }

  get metrics() {
    return this.blockData.metrics;
  }

  get loading() {
    return this.blockData.isLoading;
  }

  created() {
    if (this.metrics.length === 0) {
      findBlockWithMetrics(this.$props.id);
    }
  }

  mounted() {
    const layout = {
      width: 500,
      height: 500,
    };

    const data = [];

    this.plotly = Plotly.newPlot('plotly', [], layout);
  }
}
