import Vue from 'vue';
import Component from 'vue-class-component';
import createPlotlyComponent from 'vue-plotly.js/factory';

import Plotly from './plotly';
import { getById } from '@/store/blocks/OneWireTempSensor/getters';

/* eslint-disable indent */
@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
  components: {
    Plotly: createPlotlyComponent(Plotly),
  },
})
/* eslint-enable */
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
    return getById(this.$store, this.$props.id);
  }

  get loading() {
    return this.blockData.isLoading;
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
