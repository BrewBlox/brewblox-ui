<template>
  <div ref="plotly" />
</template>

<script>
const Plotly = require('plotly.js');

export default {
  name: 'Plotly',
  plotly: null,

  props: {
    data: {
      type: Array,
      default: () => [],
    },
    layout: {
      type: Object,
      default: () => ({}),
    },
  },

  mounted() {
    this.plotly = Plotly.newPlot(this.$refs.plotly, {
      data: this.data,
      layout: this.layout,
    });
  },
};
</script>

<style scoped>

</style>
