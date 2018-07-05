<template>
  <SVGRoot>
    <g class="outline">
      <path d="M50,21H30a1,1,0,0,1-1-1V0"/>
      <path d="M21,0V20a1,1,0,0,1-1,1H0"/>
      <line class="line" y1="29" x2="50" y2="29"/>
    </g>
    <g
      class="liquid"
      v-if="liquid"
      stroke="#ff0000"
    >
      <line y1="25" x2="50" y2="25"/>
      <path d="M0,25H20a5,5,0,0,0,5-5V0"/>
      <path d="M25,0V20a5,5,0,0,0,5,5H50"/>
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
class TeeTube extends Part {}

export default TeeTube;
</script>

<style scoped>

</style>
