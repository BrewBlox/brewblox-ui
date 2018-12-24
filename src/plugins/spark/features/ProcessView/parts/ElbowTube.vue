<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { AngledFlows } from '../state';
import { UP, RIGHT, SQUARE_SIZE, LEFT } from './';

@Component
export default class ElbowTube extends PartComponent {
  static flows(): AngledFlows {
    return {
      [UP]: [{ angleOut: RIGHT, friction: 1 }],
      [RIGHT]: [{ angleOut: UP, friction: 1 }],
    };
  }

  get direction() {
    return this.flowOnAngle(UP) > 0 ? RIGHT : UP;
  }

  arrow(frame: number) {
    const pos = this.direction === UP ? frame * SQUARE_SIZE : 42 - (frame * SQUARE_SIZE);

    const rotateFrame = this.direction === UP ? 0.43 : 0.36;
    const rotateDir = this.direction === UP ? -RIGHT : RIGHT;

    const rotate = frame > rotateFrame
      ? (rotateDir < 0 ? Math.max : Math.min)(
        this.direction + rotateDir,
        this.direction + (rotateDir * ((frame - rotateFrame) / 0.15)),
      )
      : this.direction;

    return {
      rotate,
      x: pos > 21 ? pos : 21,
      y: pos > 23 ? 23 : Math.min(23, pos + 2),
    };
  }
}
</script>

<template>
  <SVGRoot>
    <g class="outline">
      <path d="M21,0v20c0,5,4,9,9,9h20"/>
      <path d="M29,0v18c0,1.7,1.3,3,3,3h18"/>
    </g>
    <g class="liquid" v-if="liquid" stroke="#4aa0ef">
      <path d="M25,0V20a5,5,0,0,0,5,5H50"/>
    </g>
    <g v-if="flowing" class="outline">
      <FlowArrow :rotate="arrow(frame).rotate" :x="arrow(frame).x" :y="arrow(frame).y"/>
      <FlowArrow :rotate="arrow(frame - 1).rotate" :x="arrow(frame - 1).x" :y="arrow(frame - 1).y"/>
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


<style scoped>
</style>
