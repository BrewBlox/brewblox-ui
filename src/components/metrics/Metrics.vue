<script lang="ts">
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
class Metrics extends Vue {
  defaultLayout = {
    title: '',
    font: {
      color: '#fff',
    },
    margin: {
      t: 100,
      l: 80,
      r: 40,
      b: 80,
      pad: 5,
    },
    legend: { orientation: 'h' },
    xaxis: {
      type: 'date',
      gridcolor: '#666',
    },
    yaxis: {
      gridcolor: '#666',
      zerolinecolor: '#eee',
    },
    paper_bgcolor: '#1b1d21',
    plot_bgcolor: '#1b1d21',
  };

  config = {
    displaylogo: false,
  };

  get plotlyData() {
    return {
      ...this.$props.data,
      layout: merge(this.defaultLayout, this.$props.data.layout),
    };
  }
}

export default Metrics;
</script>

<template>
  <Plotly
    :data="plotlyData.data"
    :layout="plotlyData.layout"
    :config="config"
    fit
  />
</template>

<style>
.js-plotly-plot .plotly .modebar {
  top: 10px;
  background: transparent;
}

.js-plotly-plot .plotly .modebar-btn path {
  fill: rgba(255, 255, 255, 0.6);
}

.js-plotly-plot .plotly .modebar-btn.active path,
.js-plotly-plot .plotly .modebar-btn:hover path {
  fill: rgba(255, 255, 255, 1);
}
</style>
