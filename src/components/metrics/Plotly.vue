<template>
  <div :id="plotlyId">&nbsp;</div>
</template>

<script>
const Plotly = require('plotly.js');
const shortid = require('shortid');

export default {
  name: 'Plotly',
  plotly: null,

  data() {
    return {
      plotlyId: shortid.generate(),
    };
  },

  mounted() {
    const layout = {
      width: 500,
      height: 500,
    };

    const data = [];

    this.plotly = Plotly.newPlot(this.plotlyId, [], layout);
  },
};
</script>

<style scoped>

</style>
