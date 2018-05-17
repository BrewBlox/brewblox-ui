import Vue from 'vue';
import Component from 'vue-class-component';
import createPlotlyComponent from 'vue-plotly.js/factory';
import { merge } from 'lodash';

import Plotly from './plotly';

/* eslint-disable indent */
@Component({
  props: {
    data: {
      default: {},
      type: Object,
    },
  },
  components: {
    Plotly: createPlotlyComponent(Plotly),
  },
})
/* eslint-enable */
export default class Metrics extends Vue {
  defaultLayout = {
    title: '',
    font: {
      color: '#fff',
    },
    xaxis: {
      type: 'date',
      gridcolor: '#666', // grid
    },
    yaxis: {
      gridcolor: '#666', // grid
      zerolinecolor: '#eee', // zero
    },
    paper_bgcolor: '#1b1d21', // background
    plot_bgcolor: '#1b1d21', // plot background
  };

  get plotlyData() {
    return {
      ...this.$props.data,
      layout: merge(this.defaultLayout, this.$props.data.layout),
    };
  }
}
