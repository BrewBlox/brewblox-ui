import Vue from 'vue';
import Component from 'vue-class-component';
import VuePlotly from 'vue-plotly.js';

import { getById } from '../../store/blocks/OneWireTempSensor/getters';
import { findBlockWithMetrics } from '../../store/blocks/actions';

@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
  components: {
    Plotly: VuePlotly,
  },
})
export default class Metrics extends Vue {
  plotly = {
    data: [
      {
        type: 'bar',
        x: [1, 2, 3],
        y: [2, 5, 3],
      },
    ],
    layout: {
      title: 'A Fancy Plot',
    },
  };

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

  updateData() {
    setInterval(
      () => {
        this.$set(this.plotly, 'data', [
          {
            type: 'bar',
            x: [...this.plotly.data[0].x, this.plotly.data[0].x.length + 1],
            y: [...this.plotly.data[0].y, Math.floor(Math.random() * Math.floor(10))],
          },
        ]);
      },
      10,
    );
  }
}
