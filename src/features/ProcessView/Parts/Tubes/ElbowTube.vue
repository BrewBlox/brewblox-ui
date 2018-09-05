<template>
  <SVGRoot>
    <g class="outline">
      <path d="M21,0v20c0,5,4,9,9,9h20"/>
      <path d="M29,0v18c0,1.7,1.3,3,3,3h18"/>
    </g>
    <g
      class="liquid"
      v-if="liquid"
      stroke="#4aa0ef"
    >
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
        :rotate="arrow(frame - 1).rotate"
        :x="arrow(frame - 1).x"
        :y="arrow(frame - 1).y"
      />

      <FlowArrow
        :rotate="arrow(frame - 0.5).rotate"
        :x="arrow(frame - 0.5).x"
        :y="arrow(frame - 0.5).y"
      />

      <FlowArrow
        :rotate="arrow(frame + 0.5).rotate"
        :x="arrow(frame + 0.5).x"
        :y="arrow(frame + 0.5).y"
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
  static flows() {
    return {
      0: [{ out: 90, friction: 1 }],
      90: [{ out: 0, friction: 1 }],
    };
  }

  get direction() {
    return this.flowOnAngle(0) > 0 ? 90 : 0;
  }

  arrow(frame: number) {
    const pos = this.direction === 0 ? frame * 50 : 42 - (frame * 50);

    const rotateFrame = this.direction === 0 ? 0.43 : 0.36;
    const rotateDir = this.direction === 0 ? -90 : 90;

    const rotate = frame > rotateFrame ?
      (rotateDir < 0 ? Math.max : Math.min)(
        this.direction + rotateDir,
        this.direction + (rotateDir * ((frame - rotateFrame) / 0.15)),
      ) : this.direction;

    return {
      rotate,
      x: pos > 21 ? pos : 21,
      y: pos > 23 ? 23 : Math.min(23, pos + 2),
    };
  }
}

export default ElbowTube;
</script>

<style scoped>

</style>
