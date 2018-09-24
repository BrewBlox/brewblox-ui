<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import createPlotlyComponent from 'vue-plotly.js/factory';
import { merge } from 'lodash';
import { differenceInMilliseconds, getTime } from 'date-fns';

import { PlotlyData, PlotlyOptions } from './state';
import Plotly from './plotly';

@Component({
  props: {
    inputOptions: {
      type: Object, // PlotlyOptions
      required: true,
    },
    initialRange: {
      type: Number,
      default: 5 * 60 * 1000,
    },
  },
  components: {
    Plotly: createPlotlyComponent(Plotly),
  },
})
export default class Metrics extends Vue {
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
      autorange: false,
      range: [],
      rangeslider: {},
    },
    yaxis: {
      gridcolor: '#666',
      zerolinecolor: '#eee',
    },
    paper_bgcolor: '#1b1d21',
    plot_bgcolor: '#1b1d21',
  };

  cfg = {
    displaylogo: false,
  };

  range = 0;
  rangeTo = 0;

  created() {
    this.range = this.$props.initialRange;
  }

  get lastTimeStamp(): number {
    return Math
      .max(...this.$props.inputOptions.data
        .map((line: { x: number[] }) => Math.max(...line.x)));
  }

  relayout(changes: { 'xaxis.range'?: string[] }) {
    if (changes['xaxis.range']) {
      const newRange = changes['xaxis.range'] || [];

      const range = differenceInMilliseconds(newRange[1], newRange[0]);

      // update range if changed
      if (this.range !== range) {
        this.range = range;
      }

      // @TODO: safer way to check if needs to auto update
      if (this.lastTimeStamp !== getTime(newRange[1])) {
        this.rangeTo = getTime(newRange[1]);
      } else {
        this.rangeTo = 0;
      }
    }
  }

  get plotlyOptions() {
    const to = this.rangeTo === 0 ? this.lastTimeStamp : this.rangeTo;

    return {
      ...this.$props.inputOptions,
      layout: merge(
        this.defaultLayout,
        this.$props.inputOptions.layout,
        {
          xaxis: {
            range: [to - this.range, to],
          },
        },
      ),
    };
  }
}
</script>

<template>
  <Plotly
    :data="plotlyOptions.data"
    :layout="plotlyOptions.layout"
    :config="cfg"
    :onRelayout="relayout"
    fit
  />
</template>

<style scoped>
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
