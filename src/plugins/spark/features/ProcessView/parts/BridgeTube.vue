<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { AngledFlows } from '../state';
import { LEFT, RIGHT, DOWN, UP, SQUARE_SIZE } from '../getters';

@Component
export default class BridgeTube extends PartComponent {
  static flows(): AngledFlows {
    return {
      // bridge (high)
      [LEFT]: [{ angleOut: RIGHT, friction: 1 }],
      [RIGHT]: [{ angleOut: LEFT, friction: 1 }],
      // straight (low)
      [UP]: [{ angleOut: DOWN, friction: 1 }],
      [DOWN]: [{ angleOut: UP, friction: 1 }],
    };
  }

  get lowDirection() {
    return this.flowOnAngle(UP) > 0 ? UP : DOWN;
  }

  get highDirection() {
    return this.flowOnAngle(LEFT) > 0 ? RIGHT : LEFT;
  }

  get lowArrow() {
    const y = this.frame * SQUARE_SIZE;
    return {
      x: 21,
      y: this.lowDirection === DOWN ? (75 - y) - 6 : y,
    };
  }

  get highArrow() {
    const x = this.frame * SQUARE_SIZE;
    const rotateStart = 0.11;

    return {
      x: this.highDirection === RIGHT ? (75 - x) - 8 : x,
      y: 23,
    };
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
    <g v-if="lowFlowing" class="outline">
      <FlowArrow :rotate="lowDirection" :x="lowArrow.x" :y="lowArrow.y"/>
      <FlowArrow :rotate="lowDirection" :x="lowArrow.x" :y="lowArrow.y - 50"/>
      <FlowArrow :rotate="lowDirection" :x="lowArrow.x" :y="lowArrow.y + 25"/>
      <FlowArrow :rotate="lowDirection" :x="lowArrow.x" :y="lowArrow.y - 25"/>
    </g>
    <!-- high -->
    <g class="liquid" v-if="highLiquid" stroke="#4aa0ef">
      <path
        d="
        M50,25
        H41.31
        a7.69,7.69,0,0,1-6-3.46
        l-1-1.73a7.69,7.69,0,0,0-6-3.46
        H21.69
        a7.69,7.69,0,0,0-6,3.46
        l-1,1.73
        a7.69,7.69,0,0,1-6,3.46
        H0"
      />
    </g>
    <g class="outline">
      <path
        d="
        M50,21
        H41.31
        a7.69,7.69,0,0,1-6-3.46
        l-1-1.73
        a7.69,7.69,0,0,0-6-3.46
        H21.69
        a7.69,7.69,0,0,0-6,3.46
        l-1,1.73
        a7.69,7.69,0,0,1-6,3.46
        H0"
      />
      <path
        d="
        M50,29
        H41.31
        a7.69,7.69,0,0,1-6-3.46
        l-1-1.73
        a7.69,7.69,0,0,0-6-3.46
        H21.69
        a7.69,7.69,0,0,0-6,3.46
        l-1,1.73
        a7.69,7.69,0,0,1-6,3.46
        H0"
      />
    </g>
    <g v-if="highFlowing" class="outline">
      <FlowArrow :rotate="highDirection" :x="highArrow.x" :y="highArrow.y"/>
      <FlowArrow :rotate="highDirection" :x="highArrow.x - 50" :y="highArrow.y"/>
      <FlowArrow :rotate="highDirection" :x="highArrow.x + 25" :y="highArrow.y"/>
      <FlowArrow :rotate="highDirection" :x="highArrow.x - 25" :y="highArrow.y"/>
    </g>
  </SVGRoot>
</template>


<style scoped>
</style>
