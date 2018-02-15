<template>
  <svg
      viewBox={viewBox}
      class="svgparent"
    >
    <slot>
    </slot>
  </svg>
</template>

<script>
import VueTypes from 'vue-types';

// const dims = viewBox.split(' ');
// const style = { width: `${dims[2]}px`, height: `${dims[3]}px` };

export default {
  name: 'SvgParent',
  props: {
    viewBox: VueTypes.string.def('0 0 50 50'),
  },
  data() {
    return {};
  },
};
</script>

<style>
</style>
