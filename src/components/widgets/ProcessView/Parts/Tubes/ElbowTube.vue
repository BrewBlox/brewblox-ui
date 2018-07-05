<template>
  <SVGRoot>
    <g class="outline">
      <path d="M21,0v20c0,5,4,9,9,9h20"/>
      <path d="M29,0v18c0,1.7,1.3,3,3,3h18"/>
    </g>
    <g
      class="liquid"
      v-if="liquid"
      stroke="#ff0000"
    >
      <path d="M25,0V20a5,5,0,0,0,5,5H50"/>
    </g>
    <g class="outline">
      <FlowArrow
        :rotate="arrow(frame).rotate"
        :x="arrow(frame).x"
        :y="arrow(frame).y"
      />
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
class ElbowTube extends Part {
  arrow(frame: number) {
    return {
      rotate: 0,
      x: 0,
      y: 0,
    };
  }
}

export default ElbowTube;
</script>

<style scoped>

</style>
