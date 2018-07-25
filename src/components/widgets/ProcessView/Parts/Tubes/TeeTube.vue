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
      stroke="#4aa0ef"
    >
      <line y1="25" x2="50" y2="25"/>
      <path d="M0,25H20a5,5,0,0,0,5-5V0"/>
      <path d="M25,0V20a5,5,0,0,0,5,5H50"/>
    </g>
    <g
      v-if="flowing"
      class="outline"
    >
      <FlowArrow
        :rotate="arrow(frame).rotate"
        :x="arrow(frame).x"
        :y="arrow(frame).y"
      />

      <FlowArrow
        :rotate="arrow(frame).rotate"
        :x="arrow(frame + 0.5).x"
        :y="arrow(frame).y"
      />

      <FlowArrow
        :rotate="arrow(frame).rotate"
        :x="arrow(frame - 0.5).x"
        :y="arrow(frame).y"
      />

      <FlowArrow
        :rotate="arrow(frame).rotate"
        :x="arrow(frame - 1).x"
        :y="arrow(frame).y"
      />

      <FlowArrow
        :rotate="arrowUp(frame).rotate"
        :x="arrowUp(frame).x"
        :y="arrowUp(frame).y"
        :opacity="arrowUp(frame).opacity"
      />

      <FlowArrow
        :rotate="arrowUp(frame).rotate"
        :x="arrowUp(frame).x"
        :y="arrowUp(frame + 0.5).y"
        :opacity="arrowUp(frame + 0.5).opacity"
      />

      <FlowArrow
        :rotate="arrowUp(frame).rotate"
        :x="arrowUp(frame).x"
        :y="arrowUp(frame + 1).y"
        :opacity="arrowUp(frame + 1).opacity"
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
class TeeTube extends Part {
  static flows() {
    return {
      0: [90, 270],
      90: [0, 270],
      270: [0, 90],
    };
  }

  get direction() {
    return this.flowingFrom[0];
  }

  arrow(frame: number) {
    return {
      rotate: this.direction,
      x: this.direction === 90 ? (1 - frame) * 50 : frame * 50,
      y: 23,
    };
  }

  arrowUp(frame: number) {
    return {
      rotate: this.direction === 90 ? this.direction + 90 : this.direction - 90,
      x: 21,
      y: ((1 - frame) * 50) - 6,
      opacity: frame < 0.55 ? 0 : 1,
    };
  }
}

export default TeeTube;
</script>

<style scoped>

</style>
