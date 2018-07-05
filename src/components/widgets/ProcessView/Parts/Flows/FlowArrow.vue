<template>
  <polyline
    :opacity="opacity"
    :transform="transform"
    :points="points"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

/* eslint-disable */
@Component({
  props: {
    opacity: {
      type: Number,
      default: 1,
    },
    rotate: {
      type: Number,
      default: 0,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    }
  },
})
/* eslint-enable */
class FlowArrow extends Vue {
  get points() {
    const { x, y } = this.$props;

    return `${x},${y} ${x + 4},${y + 4} ${x},${y + 8}`;
  }

  get transform() {
    const { rotate, x, y } = this.$props;

    if (rotate) {
      return `rotate(${rotate}, ${x + 2}, ${y + 4})`;
    }

    return '';
  }
}

export default FlowArrow;
</script>

<style scoped>

</style>
