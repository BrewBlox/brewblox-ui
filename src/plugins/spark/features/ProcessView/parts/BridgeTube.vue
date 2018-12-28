<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { AngledFlows } from '../state';
import { LEFT, RIGHT, DOWN, UP, SQUARE_SIZE } from '../getters';

@Component
export default class BridgeTube extends PartComponent {
  static get isBridge() {
    return true;
  }

  static flows(): AngledFlows {
    return {
      // bridge (high)
      [LEFT]: [{ angleOut: RIGHT }],
      [RIGHT]: [{ angleOut: LEFT }],
      // straight (low)
      [UP]: [{ angleOut: DOWN }],
      [DOWN]: [{ angleOut: UP }],
    };
  }

  get lowReversed() {
    return this.flowOnAngle(DOWN) > 0;
  }

  get highReversed() {
    return this.flowOnAngle(RIGHT) > 0;
  }

  get lowLiquid(): boolean {
    return (this.flow[UP] || this.flow[DOWN]) !== undefined;
  }

  get highLiquid(): boolean {
    return (this.flow[LEFT] || this.flow[RIGHT]) !== undefined;
  }

  get lowFlowing(): boolean {
    return (this.flow[UP] || this.flow[DOWN] || 0) !== 0;
  }

  get highFlowing(): boolean {
    return (this.flow[LEFT] || this.flow[RIGHT] || 0) !== 0;
  }
}
</script>

<template>
  <SVGRoot>
    <!-- low -->
    <g class="outline">
      <line x1="21" y2="50" x2="21"/>
      <line x1="29" y2="50" x2="29"/>
    </g>
    <g class="liquid" v-if="lowLiquid" stroke="#4aa0ef">
      <line x1="25" y2="50" x2="25"/>
    </g>
    <AnimatedArrows v-if="lowFlowing" :reversed="lowReversed" path="M 21,50 V 0"/>
    <!-- high -->
    <g class="outline">
      <path d="M 50, 21 q -25 -20, -50 0"/>
      <path d="M 50, 29 q -25 -20, -50 0"/>
    </g>
    <g class="liquid" v-show="highLiquid" stroke="#4aa0ef">
      <path d="M 50, 25 q -25 -20, -50 0" ref="liquidpath"/>
    </g>
    <AnimatedArrows v-if="highFlowing" :reversed="highReversed" path="M 50, 29 q -25 -20, -50 0"/>
  </SVGRoot>
</template>


<style scoped>
</style>
