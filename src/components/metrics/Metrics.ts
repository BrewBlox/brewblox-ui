import Vue from 'vue';
import Component from 'vue-class-component';
import createPlotlyComponent from 'vue-plotly.js/factory';

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
export default class Metrics extends Vue {}
