<script lang="ts">
import merge from 'lodash/merge';
import { Config, Layout, PlotData } from 'plotly.js';
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

Vue.component('PlotlyGraph', () => import('./PlotlyGraph'));

/* eslint-disable @typescript-eslint/camelcase */
const layoutDefaults: () => Partial<Layout> = () => ({
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
});
/* eslint-enable */

@Component
export default class GenericGraph extends Vue {
  id: string = uid();

  @Prop({ type: Array, required: true })
  readonly data!: PlotData[];

  @Prop({ type: Object, required: true })
  readonly layout!: Partial<Layout>;

  @Prop({ type: Number, default: 0 })
  readonly revision!: number;

  @Prop({ type: String })
  public readonly width!: string;

  @Prop({ type: String })
  public readonly height!: string;

  @Prop({ type: Boolean })
  public readonly autoFit!: boolean;

  @Prop({ type: Boolean })
  public readonly autoResize!: string;

  get plotlyLayout(): Partial<Layout> {
    return merge(layoutDefaults(), this.layout);
  }

  get plotlyConfig(): Partial<Config> {
    return {
      displaylogo: false,
      responsive: true,
    };
  }

  get ready(): boolean {
    return this.data !== undefined
      && this.plotlyLayout !== undefined
      && this.plotlyConfig !== undefined;
  }

  displayError(msg: string): void {
    this.$q.notify({
      icon: 'warning',
      color: 'warning',
      message: `Failed to render graph: ${msg}`,
    });
  }
}
</script>

<template>
  <PlotlyGraph
    v-if="ready"
    :id="id"
    :data="data"
    :layout="plotlyLayout"
    :config="plotlyConfig"
    :revision="revision"
    :height="height"
    :width="width"
    :auto-fit="autoFit"
    :auto-resize="autoResize"
    class="maximized"
    @error="displayError"
    v-on="$listeners"
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
