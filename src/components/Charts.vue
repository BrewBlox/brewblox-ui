<template>
<div>
  <figure><chart id="linechart" :options="lineDemo" auto-resize></chart></figure>
</div>
</template>

<script>
import {
} from 'quasar';

import ECharts from 'vue-echarts/components/ECharts.vue';

// import ECharts modules manually to reduce bundle size
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/dataZoom';

import { mapGetters } from 'vuex';

export default {
  name: 'index',
  components: {
    chart: ECharts,
  },
  data: () => ({
    rawBeerData: {},
    errors: [],
  }),
  created() {
    this.$store.dispatch('charts/FETCH_DATA', { name: 'sample-beer-data' });
  },
  computed: {
    ...mapGetters({
      chartData: 'charts/chartData',
      plottedData: 'charts/plottedData',
    }),
    lineDemo() {
      return {
        title: {
          text: 'Beer chart example',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
        },
        dataZoom:
        {
          show: true,
          realtime: true,
        },
        xAxis: {
          type: 'time',
          data: this.plottedData.timeData,
        },
        yAxis: {},
        series: this.plottedData.series,
      };
    },
  },
  methods: {
  },
  mounted() {
  },
  beforeDestroy() {
  },
};
</script>

<style lang="stylus">
</style>
