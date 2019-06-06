<script lang="ts">
import merge from 'lodash/merge';
import { Layout, PlotData } from 'plotly.js';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

Vue.component('PlotlyGraph', () => import('./PlotlyGraph'));

@Component
export default class GraphDisplay extends Vue {
  /* eslint-disable @typescript-eslint/camelcase */
  layoutDefaults: Partial<Layout> = {
    title: '',
    font: {
      color: '#fff',
    },
    margin: {
      t: 40,
      l: 40,
      r: 0,
      b: 40,
    },
    legend: { orientation: 'h' },
    showlegend: true,
    xaxis: {
      type: 'date',
      gridcolor: '#666',
      autorange: true,
      domain: [0, 0.9],
    },
    yaxis: {
      side: 'right',
      position: 0.9,
      gridcolor: '#666',
      zerolinecolor: '#eee',
      autorange: true,
    },
    yaxis2: {
      overlaying: 'y',
      side: 'right',
      position: 0.95,
      gridcolor: '#467',
      zerolinecolor: '#aef',
      autorange: true,
      tickfont: {
        color: '#aef',
      },
    },
    paper_bgcolor: '#282c34',
    plot_bgcolor: '#282c34',
  };
  /* eslint-enable */

  @Prop({ type: Array, required: true })
  readonly data!: PlotData[];

  @Prop({ type: Object, required: true })
  readonly layout!: Partial<Layout>;

  @Prop({ type: Number, default: 0 })
  readonly revision!: number;

  get plotlyLayout(): Partial<Layout> {
    return merge(
      this.layoutDefaults,
      this.layout,
    );
  }

  get plotlyConfig() {
    return {
      displaylogo: false,
      responsive: true,
    };
  }

  get ready() {
    return this.data !== undefined
      && this.plotlyLayout !== undefined
      && this.plotlyConfig !== undefined;
  }
}
</script>

<template>
  <PlotlyGraph
    v-if="ready"
    :data="data"
    :layout="plotlyLayout"
    :config="plotlyConfig"
    :revision="revision"
    class="maximized"
    fit
  />
</template>

<style lang="stylus">
.js-plotly-plot .plotly .modebar {
  left: 0px;
  background: transparent;
}

.js-plotly-plot .plotly .modebar-btn path {
  fill: rgba(255, 255, 255, 0.6);
}

.js-plotly-plot .plotly .modebar-btn.active path, .js-plotly-plot .plotly .modebar-btn:hover path {
  fill: rgba(255, 255, 255, 1);
}

/deep/ .xy2 {
  color: green;
}
</style>
