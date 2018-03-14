<template>
  <div id="plotly">&nbsp;</div>
</template>

<script>
import * as Plotly from 'plotly.js';

export default {
  name: 'Plotly',
  plotly: null,

  mounted() {
    const layout = {
      width: 500,
      height: 500,
    };

    const data = [];

    this.plotly = Plotly.newPlot('plotly', [], layout);
  },
};
</script>

<style scoped>

</style>
