<template>
<div>
  <h5 class="charttitle">
    {{dataset}}
  </h5>
  <div ref="chart"></div>
</div>
</template>

<script>
import VueTypes from 'vue-types';
import { mapGetters } from 'vuex';

const Plotly = require('plotly.js/lib/core');

Plotly.register([
  // require('plotly.js/lib/line'), // eslint-disable-line
]);

export default {
  name: 'LineChart',
  props: {
    dataset: VueTypes.string.isRequired,
  },
  data: () => ({
    series: [
      {
        name: 'Time',
        data: [0, 1],
        type: 'category',
      },
      {
        name: 'loading',
        data: [0, 0],
        type: 'line',
      },
    ],
  }),
  created() {
    this.$store.dispatch('brews/FETCH_DATA', { name: this.dataset });
  },
  computed: {
    ...mapGetters({
      brews: 'brews/data',
      names: 'brews/names',
      brew: 'brews/getByName',
    }),
    fetchSeries() {
      return this.brew(this.dataset);
    },
  },
  methods: {
    fetch() {
      const newSeries = this.brews[this.dataset];
      if (newSeries !== undefined) {
        this.series = newSeries;
      }
    },
    plot() {
      // time data is first series
      const xdata = this.series[0].data;
      // find series that should be drawn as a lince chart
      const data = this.series.slice(1).filter(s => s.type === 'line').map(s => ({
        name: s.name,
        x: xdata,
        y: s.data,
      }));

      Plotly.plot(
        this.$refs.chart,
        data,
        {
          xaxis: {
            rangeslider: {
              type: 'date',
            },
            rangeselector: {
              buttons: [
                {
                  count: 1,
                  label: '1h',
                  step: 'hour',
                  stepmode: 'backward',
                },
                {
                  count: 6,
                  label: '6h',
                  step: 'hour',
                  stepmode: 'backward',
                },
                {
                  count: 1,
                  label: '1d',
                  step: 'day',
                  stepmode: 'backward',
                },
                {
                  count: 3,
                  label: '3d',
                  step: 'day',
                  stepmode: 'backward',
                },
                {
                  count: 7,
                  label: '1w',
                  step: 'day',
                  stepmode: 'backward',
                },
                {
                  step: 'all',
                }],
            },
          },
          yaxis: {
            fixedrange: false,
          },
          height: 750,
        },
      );
    },
  },
  mounted() {
    this.fetch();
    this.plot();
  },
  beforeDestroy() {
  },
};

</script>

<style lang="stylus">
.charttitle {
  width: 100%;
  text-align: center;
}
</style>
