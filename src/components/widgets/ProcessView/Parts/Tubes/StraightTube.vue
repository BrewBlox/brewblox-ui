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
      <FlowArrow
        :rotate="direction"
        :x="arrow.x"
        :y="arrow.y"
      />
      <FlowArrow
        :rotate="direction"
        :x="arrow.x - 50"
        :y="arrow.y"
      />
      <FlowArrow
        :rotate="direction"
        :x="arrow.x + 25"
        :y="arrow.y"
      />
      <FlowArrow
        :rotate="direction"
        :x="arrow.x - 25"
        :y="arrow.y"
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
class StraightTube extends Part {
  directionDefault: number = 270;

  get arrow() {
    const x = this.frame * 50;

    return {
      x: this.direction === 90 ? (75 - x) - 8 : x,
      y: 23,
    };
  }
}

export default StraightTube;
</script>

<style scoped>

</style>
