<template>
  <SVGRoot>
    <g class="outline">
      <line y1="21" x2="50" y2="21" />
      <line y1="29" x2="50" y2="29" />
    </g>
    <g
      class="liquid"
      v-if="liquid"
      stroke="#ff0000"
    >
      <line y1="25" x2="50" y2="25"/>
    </g>
    <g class="outline">
      <FlowArrow />
    </g>
  </SVGRoot>
</template>

<script lang="ts">
import Component from 'vue-class-component';

import SVGRoot from '../SVGRoot.vue';
import Part from '../Part';

import FlowArrow from '../Flows/FlowArrow.vue';

/* eslint-disable */
@Component({
  components: {
    SVGRoot,
    FlowArrow,
  },
})
/* eslint-enable */
class StraightTube extends Part {}

export default StraightTube;
</script>

<style scoped>

</style>
