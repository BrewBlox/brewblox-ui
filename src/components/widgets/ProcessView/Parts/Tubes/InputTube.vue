<template>
  <SVGRoot>
    <g class="outline">
      <polyline points="1.25 17.5 8.75 25 1.25 32.5"/>
      <polyline points="9.13 19.25 14.88 25 9.13 30.75"/>
      <polyline points="17 21 21 25 17 29"/>
      <line x1="30" y1="21" x2="50" y2="21"/>
      <line x1="30" y1="29" x2="50" y2="29"/>
    </g>
    <g
      class="liquid"
      v-if="liquid"
      stroke="#ff0000"
    >
      <line x1="30" y1="25" x2="50" y2="25"/>
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
class InputTube extends Part {}

export default InputTube;
</script>

<style scoped>

</style>
