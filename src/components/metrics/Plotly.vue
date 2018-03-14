<template>
  <div ref="plotly" />
</template>

<script>
const Plotly = require('plotly.js');

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export default {
  name: 'Plotly',
  plotly: null,

  props: {
    fit: {
      type: Boolean,
      default: () => false,
    },
    data: {
      type: Array,
      default: () => [],
    },
    layout: {
      type: Object,
      default: () => ({}),
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    frames: {
      type: Array,
      default: () => [],
    },
  },

  mounted() {
    this.plotly = Plotly.newPlot(this.$refs.plotly, {
      data: this.data,
      layout: this.resizedLayoutIfFit(this.layout),
      config: this.config,
      frames: this.frames,
    });
  },

  methods: {
    resizedLayoutIfFit(layout) {
      if (!this.fit) {
        return layout;
      }
      return Object.assign({}, layout, this.getSize(layout));
    },

    getSize(layoutIn) {
      let rect;
      const layout = layoutIn || this.props.layout;
      const layoutWidth = layout ? layout.width : null;
      const layoutHeight = layout ? layout.height : null;
      const hasWidth = isNumber(layoutWidth);
      const hasHeight = isNumber(layoutHeight);

      if (!hasWidth || !hasHeight) {
        rect = this.$refs.plotly.parentElement.getBoundingClientRect();
      }

      return {
        width: hasWidth ? parseInt(layoutWidth, 10) : rect.width,
        height: hasHeight ? parseInt(layoutHeight, 10) : rect.height,
      };
    },
  },
};
</script>

<style scoped>

</style>
