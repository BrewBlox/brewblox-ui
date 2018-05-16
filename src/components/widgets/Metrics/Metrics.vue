<script lang="ts">
import Component from 'vue-class-component';

import Metrics from '@/components/metrics/Metrics.vue';

import Widget from '../Widget';

function toMicroSeconds(nanoseconds: number): number {
  return Math.floor(nanoseconds / 1000000);
}

/* eslint-disable */
@Component({
  components: {
    Metrics,
  },
})
/* eslint-enable */
class MetricsWidget extends Widget {
  plotly = {
    data: [
      {
        type: 'scatter',
        x: [1526471406456307000, 1526471411462286000, 1526471416486398000].map(toMicroSeconds),
        y: [2, 5, 3],
      },
    ],
    layout: {
      title: 'A Fancy Plot',
      xaxis: { type: 'date' },
    },
  };
}

export default MetricsWidget;
</script>

<template>
  <Metrics :data="plotly" />
</template>
