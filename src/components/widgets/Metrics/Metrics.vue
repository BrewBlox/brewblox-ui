<script lang="ts">
import Component from 'vue-class-component';

import Metrics from '@/components/metrics/Metrics.vue';

import Widget from '../Widget';

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
        type: 'bar',
        x: [1, 2, 3],
        y: [2, 5, 3],
      },
    ],
    layout: {
      title: 'A Fancy Plot',
    },
  };
}

export default MetricsWidget;
</script>

<template>
  <Metrics :data="plotly" />
</template>
