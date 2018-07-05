<template>
  <SVGRoot>
    <g class="outline">
      <polyline points="40.5,17.5 48,25 40.5,32.5"/>
      <polyline points="36.4,19.3 42.1,25 36.4,30.8"/>
      <polyline points="32.3,21 36.3,25 32.3,29"/>
      <line x1="0" y1="21" x2="20" y2="21"/>
      <line x1="0" y1="29" x2="20" y2="29"/>
    </g>
    <g
      class="liquid"
      v-if="liquid"
      stroke="#ff0000"
    >
      <line x1="0" y1="25" x2="20" y2="25"/>
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
class OutputTube extends Part {}

export default OutputTube;
</script>

<style scoped>

</style>
